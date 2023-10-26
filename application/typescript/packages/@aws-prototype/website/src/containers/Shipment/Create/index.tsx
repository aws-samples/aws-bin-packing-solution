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
import { Shipment } from '@aws-samples/bin-packing-shared-types';
import { useAPIPost, createShipmentRequest } from 'api';
import ShipmentEdit from '../Edit';
import ShipmentForm from 'components/Shipment/Form';

const ShipmentCreate: FC = () => {
  const { mutate } = useAPIPost<Shipment, Shipment>(createShipmentRequest());
  return <ShipmentEdit mutate={mutate} FormComponent={ShipmentForm}/>;
};

export default ShipmentCreate;
