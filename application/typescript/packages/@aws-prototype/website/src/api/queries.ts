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
import { generatePath } from 'react-router-dom';
import {
  API_SOLUTION,
  API_PATH_CONTAINER_TYPE,
  API_PATH_CONTAINER_TYPES,
  API_PATH_ITEM_TYPE,
  API_PATH_ITEM_TYPES,
  API_PATH_SHIPMENT,
  API_PATH_SHIPMENTS,
  API_PATH_MANIFEST,
  API_PATH_SHIPMENT_MANIFESTS,
  ENTITY_KEY_CONTAINER_TYPES,
  ENTITY_KEY_ITEM_TYPES,
  ENTITY_KEY_MANIFESTS,
  ENTITY_KEY_SHIPMENTS,
  ENTITY_KEY_SHIPMENT_MANIFESTS,
  ENTITY_KEY_SOLVERS,
  API_PATH_SOLVERS,
} from 'config/api';
import { APIRequest } from './types';

export const listContainerTypesRequest = (): APIRequest => ({
  apiName: API_SOLUTION,
  queryKey: ENTITY_KEY_CONTAINER_TYPES,
  path: API_PATH_CONTAINER_TYPES,
});

export const getContainerTypeRequest = (id: string): APIRequest => ({
  apiName: API_SOLUTION,
  queryKey: [ENTITY_KEY_CONTAINER_TYPES, id],
  path: generatePath(API_PATH_CONTAINER_TYPE, {
    id,
  }),
});

export const listItemTypesRequest = (): APIRequest => ({
  apiName: API_SOLUTION,
  queryKey: ENTITY_KEY_ITEM_TYPES,
  path: API_PATH_ITEM_TYPES,
});

export const getItemTypeRequest = (id: string): APIRequest => ({
  apiName: API_SOLUTION,
  queryKey: [ENTITY_KEY_ITEM_TYPES, id],
  path: generatePath(API_PATH_ITEM_TYPE, {
    id,
  }),
});

export const listShipmentsRequest = (): APIRequest => ({
  apiName: API_SOLUTION,
  queryKey: ENTITY_KEY_SHIPMENTS,
  path: API_PATH_SHIPMENTS,
});

export const getShipmentRequest = (id: string): APIRequest => ({
  apiName: API_SOLUTION,
  queryKey: [ENTITY_KEY_SHIPMENTS, id],
  path: generatePath(API_PATH_SHIPMENT, {
    id,
  }),
});

export const listShipmentManifestsRequest = (shipmentId: string): APIRequest => ({
  apiName: API_SOLUTION,
  queryKey: [ENTITY_KEY_SHIPMENT_MANIFESTS, shipmentId],
  path: generatePath(API_PATH_SHIPMENT_MANIFESTS, {
    id: shipmentId,
  }),
});

export const getManifestRequest = (id: string): APIRequest => ({
  apiName: API_SOLUTION,
  queryKey: [ENTITY_KEY_MANIFESTS, id],
  path: generatePath(API_PATH_MANIFEST, {
    id,
  }),
});

export const listSolversRequest = (): APIRequest => ({
  apiName: API_SOLUTION,
  queryKey: ENTITY_KEY_SOLVERS,
  path: API_PATH_SOLVERS,
});
