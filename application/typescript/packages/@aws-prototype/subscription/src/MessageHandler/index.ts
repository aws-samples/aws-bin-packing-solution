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
import * as AWS from 'aws-sdk';
import { APIGatewayEvent } from 'aws-lambda';
import ConnectionHandler from '../ConnectionHandler';

const region = process.env.AWS_REGION;
AWS.config.update({ region });

const websocketEndpoint = (process.env.WEBSOCKET_URL || '').replace('wss://', '');

class MessageHandler {
  send = async (connectionId: string, data: any) => {
    await this.sendMessage(connectionId, data);
  };

  sendHeartbeat = async (event: APIGatewayEvent, connectionId: string) => {
    const heartbeatMsg = { type: 'heartbeat' };
    await this.sendMessage(connectionId, heartbeatMsg, event);
  };

  private sendMessage = async (connectionId: string, data: any, event?: APIGatewayEvent) => {
    try {
      const apigwManagementApi = new AWS.ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: event ? `${event.requestContext.domainName}/${event.requestContext.stage}` : websocketEndpoint,
      });
      await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: JSON.stringify(data) }).promise();
    } catch (e) {
      const err = e as { statusCode: number };
      if (err?.statusCode === 410) {
        console.log(`Found stale connection, deleting ${connectionId}`);
        try {
          await new ConnectionHandler().remove(connectionId);
        } catch (de) {
          console.log(`Error in removing stale connection ${connectionId}`, de);
        }
      } else {
        console.log(`Error in sending message to ${connectionId}`, e);
      }
    }
  };
}

export default MessageHandler;
