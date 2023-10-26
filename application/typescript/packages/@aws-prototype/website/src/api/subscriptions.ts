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
import {Manifest, SUBSCRIPTION_TYPE_MANIFEST_UPDATE} from '@aws-samples/bin-packing-shared-types';
import {ENTITY_KEY_MANIFESTS, ENTITY_KEY_SHIPMENT_MANIFESTS} from 'config/api';
import {Subscription} from './types';

export const subscribeManifestUpdateForShipmentRequest = (shipmentId: string, manifestId: string, callback: (newData: Manifest) => void): Subscription<{ id: string }, Manifest> => ({
    type: SUBSCRIPTION_TYPE_MANIFEST_UPDATE,
    payload: {
        id: manifestId,
    },
    queryKeys: [
        [ENTITY_KEY_MANIFESTS, manifestId],
        [ENTITY_KEY_SHIPMENT_MANIFESTS, shipmentId],
    ],
    onDataReceived: callback
});
