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
  API_PATH_CONTAINER_TYPES,
  API_PATH_CONTAINER_TYPE,
  ENTITY_KEY_CONTAINER_TYPES,
  ENTITY_KEY_ITEM_TYPES,
  API_PATH_ITEM_TYPE,
  ENTITY_KEY_SHIPMENTS,
  API_PATH_SHIPMENT,
  API_PATH_ITEM_TYPES,
  API_PATH_SHIPMENTS,
  ENTITY_KEY_SHIPMENT_MANIFESTS,
  API_PATH_MANIFESTS,
  API_PATH_SOLVERS,
  ENTITY_KEY_SOLVERS
} from 'config/api';
import { APIRequest } from './types';

export const createContainerTypeRequest = (): APIRequest => ({
  apiName: API_SOLUTION,
  queryKey: ENTITY_KEY_CONTAINER_TYPES,
  path: API_PATH_CONTAINER_TYPES,
});

export const updateContainerTypeRequest = (id: string): APIRequest => ({
  apiName: API_SOLUTION,
  queryKey: [ENTITY_KEY_CONTAINER_TYPES, id],
  path: generatePath(API_PATH_CONTAINER_TYPE, {
    id,
  }),
});

export const deleteContainerTypeRequest = (): APIRequest => ({
  apiName: API_SOLUTION,
  queryKey: ENTITY_KEY_CONTAINER_TYPES,
  getPath: (payload) =>
    generatePath(API_PATH_CONTAINER_TYPE, {
      id: payload.id,
    }),
});

export const createItemTypeRequest = (): APIRequest => ({
  apiName: API_SOLUTION,
  queryKey: ENTITY_KEY_ITEM_TYPES,
  path: API_PATH_ITEM_TYPES,
});

export const updateItemTypeRequest = (id: string): APIRequest => ({
  apiName: API_SOLUTION,
  queryKey: [ENTITY_KEY_ITEM_TYPES, id],
  path: generatePath(API_PATH_ITEM_TYPE, {
    id,
  }),
});

export const deleteItemTypeRequest = (): APIRequest => ({
  apiName: API_SOLUTION,
  queryKey: ENTITY_KEY_ITEM_TYPES,
  getPath: (payload) =>
    generatePath(API_PATH_ITEM_TYPE, {
      id: payload.id,
    }),
});

export const createShipmentRequest = (): APIRequest => ({
  apiName: API_SOLUTION,
  queryKey: ENTITY_KEY_SHIPMENTS,
  path: API_PATH_SHIPMENTS,
});

export const createManifestRequest = (shipmentId: string): APIRequest => ({
  apiName: API_SOLUTION,
  queryKey: [ENTITY_KEY_SHIPMENT_MANIFESTS, shipmentId],
  path: API_PATH_MANIFESTS,
});

export const updateShipmentRequest = (id: string): APIRequest => ({
  apiName: API_SOLUTION,
  queryKey: [ENTITY_KEY_SHIPMENTS, id],
  path: generatePath(API_PATH_SHIPMENT, {
    id,
  }),
});

export const deleteShipmentRequest = (): APIRequest => ({
  apiName: API_SOLUTION,
  queryKey: ENTITY_KEY_SHIPMENTS,
  getPath: (payload) =>
    generatePath(API_PATH_SHIPMENT, {
      id: payload.id,
    }),
});

export const updateSolverSettingsRequest = (): APIRequest => ({
  apiName: API_SOLUTION,
  queryKey: ENTITY_KEY_SOLVERS,
  path: API_PATH_SOLVERS,
});
