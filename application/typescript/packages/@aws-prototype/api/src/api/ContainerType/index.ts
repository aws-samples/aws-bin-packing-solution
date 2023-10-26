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
import { ContainerType } from '@aws-samples/bin-packing-shared-types';
import CrudService from '../../Common/CrudService';
import { NO_BODY, NO_ID } from '../../Common/Types';
import APIEventHandler from '../../Common/APIEventHandler';
import { v4 as uuidv4 } from 'uuid';

const attr = require('dynamodb-data-types').AttributeValue;

const TABLE_NAME = process.env.ContainerTypeTable!;

export default class ContainerTypeEventHandler extends APIEventHandler {
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
        return;
      default:
        return {
          statusCode: 500,
          body: JSON.stringify({ message: 'Received container type route request, but could not find event handler.' }),
        };
    }
  };

  private async handlePutPost(event: APIGatewayProxyEventV2) {
    if (!event.body) throw NO_BODY;
    const jsonObj = JSON.parse(event.body);
    const containerType: ContainerType = <ContainerType>jsonObj;
    if (event.requestContext.http.method === 'POST') containerType.Id = uuidv4();
    else if (event.requestContext.http.method === 'PUT' && !containerType.Id) throw NO_ID;
    const crudService = new CrudService();
    console.log(`JSON object parsed: ${JSON.stringify(containerType)}`);
    try {
      await crudService.put(attr.wrap(containerType), TABLE_NAME);

      return {
        statusCode: 200,
        body: JSON.stringify(containerType.Id),
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

  private async handleGet(event: APIGatewayProxyEventV2) {
    if (event?.pathParameters !== undefined && event.pathParameters.id !== undefined) {
      const id = event?.pathParameters.id;
      return await super.handleGetOne(TABLE_NAME, id);
    } else return await super.handleList(TABLE_NAME, event);
  }
}
