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
import { deleteItemTypeRequest, getItemTypeRequest } from 'api';
import ItemTypeDetailsComponent from 'components/ItemType/Details';
import GenericDetails from 'components/GenericDetails';
import { ROUTE_ITEM_TYPE_UPDATE } from 'config/routes';

const ItemTypeDetails: FC = () => {
  return (
    <GenericDetails 
      getRequest={getItemTypeRequest}
      DetailsComponent={ItemTypeDetailsComponent}
      deleteRequest={deleteItemTypeRequest}
      routeUpdate={ROUTE_ITEM_TYPE_UPDATE}
    />
  );
};

export default ItemTypeDetails;
