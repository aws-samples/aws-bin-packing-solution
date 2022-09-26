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
 import { FC } from 'react';
 import { Shipment, ContainerType, ItemType } from '@aws-prototype/shared-types';
 import { useAPIGet, listContainerTypesRequest, listItemTypesRequest } from 'api';
 import GenericEdit, { GenericEditProps } from 'components/GenericEdit';
import { ShipmentFormAdditionalProps } from 'components/Shipment/Form';

 const ShipmentEdit: FC<GenericEditProps<Shipment, ShipmentFormAdditionalProps>> = (props) => {
   const { data: containerTypes } = useAPIGet<ContainerType[]>(listContainerTypesRequest());
   const { data: itemTypes } = useAPIGet<ItemType[]>(listItemTypesRequest());
   
   return (
     <GenericEdit {...props} additionalProps={{
       containerTypes: containerTypes || [],
       itemTypes: itemTypes || []
     }}/>
   );
 };
 
 export default ShipmentEdit;
 