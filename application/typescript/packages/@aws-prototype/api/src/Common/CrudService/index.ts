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
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb';

export default class CrudService {
  private readonly client: DynamoDBClient;

  constructor() {
    this.client = new DynamoDBClient({});
  }

  async put(item: any, tableName: string) {
    const command = new PutItemCommand({
      Item: item,
      TableName: tableName,
    });

    console.log(`:: Putting data to DDB :: ${JSON.stringify(command)}`);

    const response = await this.client.send(command);
    console.log(`:: DDB PutResponse: ${JSON.stringify(response)}`);
  }

  async delete(id: string, tableName: string) {
    const command = new DeleteItemCommand({
      TableName: tableName,
      Key: {
        Id: { S: id },
      },
    });

    console.log(`:: Deleting data from DDB :: ${JSON.stringify(command)}`);

    const response = await this.client.send(command);

    console.log(`:: DDB Delete Response: ${JSON.stringify(response)}`);
  }

  async get(id: string, tableName: string) {
    const command = new GetItemCommand({
      Key: { Id: { S: id } },
      TableName: tableName,
    });
    const result = await this.client.send(command);

    console.log(`:: Returned items from DDB : ${JSON.stringify(result)}`);

    return result.Item;
  }

  async list(tableName: string) {
    const command = new ScanCommand({
      TableName: tableName,
    });
    const response = await this.client.send(command);

    console.log(`:: Returned items from DDB : ${JSON.stringify(response)}`);

    return response.Items;
  }
}
