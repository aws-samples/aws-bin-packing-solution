/**********************************************************************************************************************
Licensed to the Apache Software Foundation (ASF) under one or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the License for the
specific language governing permissions and limitations under the License.
 **********************************************************************************************************************/
import { APIGatewayProxyEventV2 } from 'aws-lambda';

import { Manifest } from '@aws-samples/bin-packing-shared-types';
import CrudService from '../../Common/CrudService';
import { BUCKET_NOT_FOUND, NOT_FOUND, NO_BODY, NO_ID, PresignedUrlResult } from '../../Common/Types';
import APIEventHandler from '../../Common/APIEventHandler';
import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { LambdaClient, InvokeCommand, InvocationType } from '@aws-sdk/client-lambda';
import { SSMClient, GetParameterCommand, GetParameterCommandInput } from '@aws-sdk/client-ssm';
import * as rgTag from '@aws-sdk/client-resource-groups-tagging-api';

const ssmClient = new SSMClient({});
const ssmStringParamsMap: Record<string, string> = {};

const attr = require('dynamodb-data-types').AttributeValue;

const TABLE_NAME = process.env.ManifestTable!;
const PACKING_CONTAINERS_TABLE = process.env.PackingContainersTable!;
const PACKING_CONTAINERS_MANIFEST_INDEX = process.env.PackingContainersManifestIdIndex!;
const PACKING_ITEMS_MANIFEST_INDEX = process.env.PackingItemsManifestIdIndex!;
const PACKING_ITEMS_TABLE = process.env.PackingItemsTable!;
const SHIPMENT_ID_INDEX_NAME = process.env.ManifestsShipmentIdIndex;
const LAMBA_ARN_SSM_PARAM_NAME = process.env.SolverLambdaArnSsmParamName!;

export default class ManifestEventHandler extends APIEventHandler {
  constructor() {
    super();
  }

  handleEvent = async (event: APIGatewayProxyEventV2) => {
    switch (event.requestContext.http.method) {
      case 'GET':
        return await this.handleGet(event);
        break;
      case 'POST':
      case 'PUT':
        return await this.handlePutPost(event);
        break;
      case 'DELETE':
        return await this.handleDeleteEvent(event);
      default:
        return {
          statusCode: 500,
          body: JSON.stringify({ message: 'Received manifest route request, but could not find event handler.' }),
        };
    }
  };

  private async handleDeleteEvent(event: APIGatewayProxyEventV2) {
    if (event?.pathParameters !== undefined && event.pathParameters.id !== undefined) {
      const id = event?.pathParameters.id;
      return await super.handleDelete(TABLE_NAME, id);
    } else
      return {
        statusCode: 500,
        body: JSON.stringify(NO_ID),
        headers: {
          'Content-Type': 'application/json',
        },
      };
  }

  // Invokes the solver lambda function to kick off a solve
  private async invokeSolverFunction(manifestId: string, solverFunctionArn: string) {
    const client = new LambdaClient({});

    const payload = Buffer.from(JSON.stringify({ ManifestId: manifestId }), 'utf-8');

    const command = new InvokeCommand({
      FunctionName: solverFunctionArn,
      InvocationType: InvocationType.Event,
      Payload: payload,
    });

    console.log(`Executing solver lambda function ${solverFunctionArn} with params ${JSON.stringify(command)}`);

    const invokeResponse = await client.send(command);
    console.log(`Executed solver lambda function ${solverFunctionArn} with response ${JSON.stringify(invokeResponse)}`);
  }

  private async handlePutPost(event: APIGatewayProxyEventV2) {
    if (!event.body) throw NO_BODY;
    const jsonObj = JSON.parse(event.body);
    const manifest: Manifest = <Manifest>jsonObj;
    console.log(`JSON object parsed: ${JSON.stringify(manifest)}`);

    if (event.requestContext.http.method === 'POST') {
      manifest.Id = uuidv4();
      manifest.status = 'Processing';
    } else if (event.requestContext.http.method === 'PUT' && !manifest.Id) throw NO_ID;

    var solverFunctionArn;
    try {
      solverFunctionArn = await this.getLambdaArnFromSSM(LAMBA_ARN_SSM_PARAM_NAME);
    } catch (error) {
      console.log('Error in retrieving solver arn from SSM: ' + error);
      return {
        statusCode: 500,
        body: JSON.stringify(error),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    var solverLambdaTags;
    try {
      const solverLambdaTagsMapping = await this.getTags([solverFunctionArn]);
      solverLambdaTags = solverLambdaTagsMapping[0]?.Tags;
    } catch (error) {
      console.log('Error in retrieving solver lambda tags: ' + error);
    }
    try {
      manifest.solverLambdaName = await this.getNameTag(solverLambdaTags || []);
      const crudService = new CrudService();
      await crudService.put(attr.wrap(manifest), TABLE_NAME);

      try {
        if (event.requestContext.http.method === 'POST') {
          await this.invokeSolverFunction(manifest.Id!, solverFunctionArn);
        }
      } catch (err) {
        // Update the status of the manifest
        manifest.status = 'Error';
        await crudService.put(attr.wrap(manifest), TABLE_NAME);
        // Throw again so it gets caught by wrapping try catch
        throw err;
      }

      return {
        statusCode: 200,
        body: JSON.stringify(manifest.Id),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    } catch (error) {
      console.log('Error in computing manifest: ' + error);
      return {
        statusCode: 500,
        body: JSON.stringify(error),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }
  }

  private async getPackingItemsByManifestId(manifestId: string) {
    const queryCommand = new QueryCommand({
      TableName: PACKING_ITEMS_TABLE,
      IndexName: PACKING_ITEMS_MANIFEST_INDEX,
      KeyConditionExpression: 'manifestId=:s',
      ExpressionAttributeValues: {
        ':s': {
          S: manifestId,
        },
      },
    });

    console.log(`:: Getting data from DDB - getPackingItemsByManifestId :: ${JSON.stringify(queryCommand)}`);
    const response = await this.ddbClient.send(queryCommand);
    console.log(`:: Got response from DDB - getPackingItemsByManifestId :: ${JSON.stringify(response)}`);

    return response.Items?.map((i: any) => {
      return attr.unwrap(i);
    });
  }

  private async getPackingContainersByManifestId(manifestId: string) {
    const queryCommand = new QueryCommand({
      TableName: PACKING_CONTAINERS_TABLE,
      IndexName: PACKING_CONTAINERS_MANIFEST_INDEX,
      KeyConditionExpression: 'manifestId=:s',
      ExpressionAttributeValues: {
        ':s': {
          S: manifestId,
        },
      },
    });

    console.log(`:: Getting data from DDB - getPackingContainersByManifestId :: ${JSON.stringify(queryCommand)}`);
    const response = await this.ddbClient.send(queryCommand);
    console.log(`:: Got response from DDB - getPackingContainersByManifestId :: ${JSON.stringify(response)}`);

    return response.Items?.map((i: any) => {
      return attr.unwrap(i);
    });
  }

  private async convertDynamoManifestToObject(manifest: any) {
    const manifestObj = attr.unwrap(manifest);
    const packingContainers = await this.getPackingContainersByManifestId(manifestObj.Id);
    manifestObj.packingContainers = packingContainers;
    const packingItems = await this.getPackingItemsByManifestId(manifestObj.Id);
    manifestObj.packingItems = packingItems;

    console.log(`::convertDynamoManifestToObject :: returned ${JSON.stringify(manifestObj)}`);

    return manifestObj;
  }

  private async getManifestByShipment(shipmentId: string | undefined) {
    if (!shipmentId)
      return {
        statusCode: 500,
        body: JSON.stringify(NO_ID),
        headers: {
          'Content-Type': 'application/json',
        },
      };

    const queryCommand = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: SHIPMENT_ID_INDEX_NAME,
      KeyConditionExpression: 'shipmentId=:s',
      ExpressionAttributeValues: {
        ':s': {
          S: shipmentId,
        },
      },
    });

    console.log(`:: Getting data from DDB - getManifestByShipment :: ${JSON.stringify(queryCommand)}`);
    const response = await this.ddbClient.send(queryCommand);
    console.log(`:: Got response from DDB - getManifestByShipment :: ${JSON.stringify(response)}`);

    try {
      if (response && response.Items && response.Items.length >= 0) {
        const manifests = await Promise.all(response.Items.map((item) => this.convertDynamoManifestToObject(item)));

        return {
          statusCode: 200,
          body: JSON.stringify(manifests),
          headers: {
            'Content-Type': 'application/json',
          },
        };
      }

      return {
        statusCode: 500,
        body: JSON.stringify(NOT_FOUND),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    } catch (error) {
      console.error('Error in generating response', error);
      return {
        statusCode: 500,
        body: JSON.stringify(error),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }
  }

  private async handleGetPresignedUrl(manifest: Manifest) {
    let result: PresignedUrlResult;
    if (!manifest.resultsS3Key) {
      result = { urlFound: false };
    } else {
      const storageBucketName = process.env.StorageBucket;
      if (!storageBucketName) throw BUCKET_NOT_FOUND;
      const client = new S3Client({});
      const url = await getSignedUrl(
        client,
        new GetObjectCommand({ Bucket: storageBucketName, Key: manifest.resultsS3Key }),
        {
          expiresIn: 15 * 60,
        },
      );
      result = { urlFound: true, url: url };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    };
  }

  override async handleGetOne(tableName: string, Id: string) {
    const result = await new CrudService().get(Id, tableName);
    if (result === undefined) return {};
    else {
      const manifest = await this.convertDynamoManifestToObject(result);
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(manifest),
      };
    }
  }

  private async handleGet(event: APIGatewayProxyEventV2) {
    if (event?.pathParameters?.shipmentId) {
      const shipmentId = event?.pathParameters.shipmentId;
      return await this.getManifestByShipment(shipmentId);
    } else if (event?.pathParameters?.id) {
      if (event.requestContext.routeKey === 'GET /manifest/result/{id}') {
        const getResult = await this.handleGetOne(TABLE_NAME, event?.pathParameters.id);
        if (!getResult.body) throw NOT_FOUND;
        const jsonObj = JSON.parse(getResult.body);
        const manifest: Manifest = <Manifest>jsonObj;
        return await this.handleGetPresignedUrl(manifest);
      }

      const id = event?.pathParameters.id;
      return await this.handleGetOne(TABLE_NAME, id);
    }

    return await super.handleList(TABLE_NAME, event);
  }

  private async getLambdaArnFromSSM(paramName: string): Promise<string> {
    if (ssmStringParamsMap[paramName]) {
      return ssmStringParamsMap[paramName] || '';
    }

    const command = new GetParameterCommand({
      Name: paramName,
    });

    try {
      const response = await ssmClient.send(command);
      const value = response?.Parameter?.Value;

      if (!value) throw new Error(`String value not available in SSM parameter ${paramName}`);
      ssmStringParamsMap[paramName] = value;
      return value;
    } catch (error) {
      console.error(error);
      throw new Error(`Error while attempting to get SSM parameter ${paramName}`);
    }
  }

  private async getTags(resourceArns: string[]): Promise<rgTag.ResourceTagMapping[]> {
    try {
      const rgtClient = new rgTag.ResourceGroupsTaggingAPIClient({});
      const result = await rgtClient.send(new rgTag.GetResourcesCommand({ ResourceARNList: resourceArns }));

      return result.ResourceTagMappingList ? result.ResourceTagMappingList : [];
    } catch (error) {
      console.error('Error getting tags ' + error);
      return [];
    }
  }

  private async getNameTag(solverLambdaTags: rgTag.Tag[]): Promise<string> {
    for (var tag of solverLambdaTags) {
      if (tag.Key === 'Name') {
        return tag.Value || 'defaultSolverName';
      }
    }
    return 'defaultSolverName';
  }
}
