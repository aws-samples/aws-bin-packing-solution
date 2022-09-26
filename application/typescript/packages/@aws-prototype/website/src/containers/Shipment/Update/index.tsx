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
import { useParams } from 'react-router-dom';
import { Shipment } from '@aws-prototype/shared-types';
import { useAPIPut, useAPIGet, getShipmentRequest, updateShipmentRequest } from 'api';
import QueryContainerTemplate from 'components/QueryContainerTemplate';
import ShipmentForm from 'components/Shipment/Form';
import ShipmentEdit from '../Edit';

const ShipmentUpdate: FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useAPIGet<Shipment>(getShipmentRequest(id));
  
  const { mutate } = useAPIPut<Shipment, Shipment>(updateShipmentRequest(id));
 
  return (
    <QueryContainerTemplate loading={isLoading} error={error} data={data}>
      {(data) => <ShipmentEdit initialValues={data} mutate={mutate} FormComponent={ShipmentForm}/>}
    </QueryContainerTemplate>
  );
};

export default ShipmentUpdate;
