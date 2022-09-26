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
import { APIGatewayEvent } from 'aws-lambda';

import ConnectionHandler from '../ConnectionHandler';
import SubscriptionHandler from '../SubscriptionHandler';
import MessageHandler from '../MessageHandler';

class WebSocketEventHandler {
  handle = async (event: APIGatewayEvent) => {
    try {
      const response = await this.dispatch(event);
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE',
        },
        body: JSON.stringify(response),
      };
    } catch (e) {
      console.log('Error', e);
      throw e;
    }
  };

  private dispatch = async (event: APIGatewayEvent) => {
    if (!event.requestContext.connectionId) {
      throw new Error('Missing connectionId');
    }

    switch (event.requestContext.routeKey) {
      case '$connect':
        return new ConnectionHandler().add(event.requestContext.connectionId);
      case '$disconnect':
        return new ConnectionHandler().remove(event.requestContext.connectionId);
      case '$default': {
        const data = event.body ? JSON.parse(event.body) : null;
        if (data && data.action) {
          return this.dispatchAction(event, event.requestContext.connectionId, data.action, data.type, data.payload);
        }

        throw new Error('Unknown data format');
      }
      default:
        throw new Error(`UnSupported route: ${event.requestContext.routeKey}`);
    }
  };

  private dispatchAction = async (
    event: APIGatewayEvent,
    connectionId: string,
    action: string,
    type: string,
    payload?: any,
  ) => {
    switch (action) {
      case 'subscribe':
        return new SubscriptionHandler().subscribe(connectionId, type, payload);
      case 'unsubscribe':
        return new SubscriptionHandler().unsubscribe(connectionId, type, payload);
      case 'heartbeat': {
        await new MessageHandler().sendHeartbeat(event, connectionId);
        return {};
      }
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  };
}

export default WebSocketEventHandler;
