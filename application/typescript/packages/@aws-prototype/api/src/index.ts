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
import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2 } from 'aws-lambda';

import ContainerTypeEventHandler from './api/ContainerType';
import ItemTypeEventHandler from './api/ItemType';
import ShipmentEventHandler from './api/Shipment';
import ManifestEventHandler from './api/Manifest';
import SolverEventHandler from './api/Solver';

export const handler = async (event: APIGatewayProxyEventV2) => {
  console.log('Received event', event);

  switch (event.requestContext.routeKey) {
    case 'GET /container/type':
    case 'GET /container/type/{id}':
    case 'DELETE /container/type/{id}':
    case 'POST /container/type':
    case 'PUT /container/type/{id}':
      return await new ContainerTypeEventHandler().handleEvent(event);
    case 'GET /item/type':
    case 'POST /item/type':
    case 'GET /item/type/{id}':
    case 'PUT /item/type/{id}':
    case 'DELETE /item/type/{id}':
      return await new ItemTypeEventHandler().handleEvent(event);
    case 'GET /shipment':
    case 'POST /shipment':
    case 'GET /shipment/{id}':
    case 'PUT /shipment/{id}':
    case 'DELETE /shipment/{id}':
      return await new ShipmentEventHandler().handleEvent(event);
    case 'GET /shipment/{shipmentId}/manifest':
    case 'GET /manifest/{id}':
    case 'GET /manifest':
    case 'GET /manifest/result/{id}':
    case 'POST /manifest':
    case 'PUT /manifest/{id}':
    case 'DELETE /manifest/{id}':
      return await new ManifestEventHandler().handleEvent(event);
      break;
    case 'GET /solver':
    case 'POST /solver':
      return await new SolverEventHandler().handleEvent(event);
      break;
    default:
      return {
        statusCode: 200,
        body: JSON.stringify({ message: `No routing path for ${event.requestContext.http.path}` }),
      };
  }
};
