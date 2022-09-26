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

import APIEventHandler from '../../Common/APIEventHandler';
import { LambdaClient, ListFunctionsCommand, ListTagsCommand } from '@aws-sdk/client-lambda';
import { SSMClient, PutParameterCommand, GetParameterCommand } from '@aws-sdk/client-ssm';
import { Solver } from '@aws-prototype/shared-types';
import { NO_BODY } from '../../Common/Types';
const attr = require('dynamodb-data-types').AttributeValue;

const TABLE_NAME = process.env.ManifestTable!;
const LAMBA_ARN_SSM_PARAM_NAME = process.env.SolverLambdaArnSsmParamName!;

export default class SolverEventHandler extends APIEventHandler {
  constructor() {
    super();
  }

  async handleEvent(event: APIGatewayProxyEventV2) {
    switch (event.requestContext.http.method) {
      case 'GET':
        return await this.handleGet(event);
        break;
      case 'POST':
        return await this.handlePost(event);
        break;
    }
  }

  private async handleGet(event: APIGatewayProxyEventV2) {
    // List the lambda function names that have the solver tag
    try {
      const lambdaClient = new LambdaClient({});

      const listFunctionsCommand = new ListFunctionsCommand({});
      const listResponse = await lambdaClient.send(listFunctionsCommand);

      const ssmClient = new SSMClient({});

      const command = new GetParameterCommand({
        Name: LAMBA_ARN_SSM_PARAM_NAME,
      });

      const ssmParamResponse = await ssmClient.send(command);

      const configuredSolverArn = ssmParamResponse.Parameter?.Value;

      const functions: { name: string; arn: string; selected: boolean }[] = (
        await Promise.all(
          (listResponse.Functions || []).map(async (fn) => {
            const getTagsCommand = new ListTagsCommand({ Resource: fn.FunctionArn });
            const getTagsResponse = await lambdaClient.send(getTagsCommand);
            const tags = getTagsResponse.Tags;
            if (tags?.Type === 'Solver' && tags?.Name) {
              return [{ name: tags?.Name, arn: fn.FunctionArn!, selected: fn.FunctionArn === configuredSolverArn }];
            }
            return [];
          }),
        )
      ).flat();
      return functions;
    } catch (error) {
      console.log(error);
    }
  }

  private async handlePost(event: APIGatewayProxyEventV2) {
    if (!event.body) throw NO_BODY;
    const jsonObj = JSON.parse(event.body);
    const solver: Solver = <Solver>jsonObj;
    console.log(`JSON object parsed: ${JSON.stringify(solver)}`);
    try {
      const ssmClient = new SSMClient({});

      const command = new PutParameterCommand({
        Name: LAMBA_ARN_SSM_PARAM_NAME,
        Value: solver.arn,
        Overwrite: true,
      });

      await ssmClient.send(command);

      return {
        statusCode: 200,
        body: solver.name,
        headers: {
          'Content-Type': 'application/json',
        },
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify(error),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }
  }
}
