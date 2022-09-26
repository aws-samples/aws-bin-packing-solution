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
import { APIGatewayEvent, DynamoDBStreamEvent } from 'aws-lambda';
import WebSocketEventHandler from './WebSocketEventHandler';
import DynamoDBStreamEventHandler from './DynamoDBStreamEventHandler';

exports.handler = async (event: APIGatewayEvent | DynamoDBStreamEvent) => {
  console.log('Event: \n' + JSON.stringify(event, null, 2));

  if ((event as APIGatewayEvent).requestContext) {
    return new WebSocketEventHandler().handle(event as APIGatewayEvent);
  }

  return new DynamoDBStreamEventHandler().handle(event as DynamoDBStreamEvent);
};
