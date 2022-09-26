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
import CrudService from '../../Common/CrudService';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const attr = require('dynamodb-data-types').AttributeValue;

export default abstract class APIEventHandler {
  protected readonly ddbClient: DynamoDBClient;

  constructor() {
    this.ddbClient = new DynamoDBClient({});
  }

  protected async handleList(tableName: string, event: APIGatewayProxyEventV2) {
    const listItems = await new CrudService().list(tableName);

    if (!listItems) {
      return {
        statusCode: 200,
        body: JSON.stringify([]),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    const items = listItems.map((i: any) => attr.unwrap(i));

    return {
      statusCode: 200,
      body: JSON.stringify(items),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // return new CrudService().list(TABLE_NAME);
  }

  protected async handleDelete(tableName: string, Id: string) {
    const result = await new CrudService().delete(Id, tableName);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attr.unwrap(result)),
    };
  }

  protected async handleGetOne(tableName: string, Id: string) {
    const result = await new CrudService().get(Id, tableName);
    if (result === undefined) return {};
    else {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attr.unwrap(result)),
      };
    }
  }
}
