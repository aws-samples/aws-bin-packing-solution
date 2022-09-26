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
import {
  ROUTE_CONTAINER_TYPE_CREATE,
  ROUTE_CONTAINER_TYPE_DETAILS,
  ROUTE_CONTAINER_TYPE_LIST,
  ROUTE_CONTAINER_TYPE_UPDATE,
  ROUTE_ITEM_TYPE_CREATE,
  ROUTE_ITEM_TYPE_DETAILS,
  ROUTE_ITEM_TYPE_LIST,
  ROUTE_ITEM_TYPE_UPDATE,
  ROUTE_SHIPMENT_CREATE,
  ROUTE_SHIPMENT_DETAILS,
  ROUTE_SHIPMENT_LIST,
  ROUTE_SHIPMENT_MANIFEST_DETAILS,
  ROUTE_SHIPMENT_UPDATE,
  ROUTE_SETTINGS,
} from 'config/routes';

import ContainerTypeCreate from 'containers/ContainerType/Create';
import ContainerTypeList from 'containers/ContainerType/List';
import ContainerTypeUpdate from 'containers/ContainerType/Update';
import ContainerTypeDetails from 'containers/ContainerType/Details';

import ItemTypeCreate from 'containers/ItemType/Create';
import ItemTypeList from 'containers/ItemType/List';
import ItemTypeUpdate from 'containers/ItemType/Update';
import ItemTypeDetails from 'containers/ItemType/Details';

import ShipmentCreate from 'containers/Shipment/Create';
import ShipmentDetails from 'containers/Shipment/Details';
import ShipmentList from 'containers/Shipment/List';
import ShipmentUpdate from 'containers/Shipment/Update';
import ShipmentManifestDetails from 'containers/Manifest/Details';

import Dashboard from 'containers/Dashboard';
import SolversList from 'containers/Solver/List';

const routes = [
  {
    path: ROUTE_CONTAINER_TYPE_LIST,
    Component: ContainerTypeList,
    exact: true,
  },
  {
    path: ROUTE_CONTAINER_TYPE_CREATE,
    Component: ContainerTypeCreate,
    exact: true,
  },
  {
    path: ROUTE_CONTAINER_TYPE_DETAILS,
    Component: ContainerTypeDetails,
    exact: true,
  },
  {
    path: ROUTE_CONTAINER_TYPE_UPDATE,
    Component: ContainerTypeUpdate,
    exact: true,
  },
  {
    path: ROUTE_ITEM_TYPE_LIST,
    Component: ItemTypeList,
    exact: true,
  },
  {
    path: ROUTE_ITEM_TYPE_CREATE,
    Component: ItemTypeCreate,
    exact: true,
  },
  {
    path: ROUTE_ITEM_TYPE_DETAILS,
    Component: ItemTypeDetails,
    exact: true,
  },
  {
    path: ROUTE_ITEM_TYPE_UPDATE,
    Component: ItemTypeUpdate,
    exact: true,
  },
  {
    path: ROUTE_SHIPMENT_LIST,
    Component: ShipmentList,
    exact: true,
  },
  {
    path: ROUTE_SHIPMENT_LIST,
    Component: ShipmentList,
    exact: true,
  },
  {
    path: ROUTE_SHIPMENT_CREATE,
    Component: ShipmentCreate,
    exact: true,
  },
  {
    path: ROUTE_SHIPMENT_DETAILS,
    Component: ShipmentDetails,
    exact: true,
  },
  {
    path: ROUTE_SHIPMENT_UPDATE,
    Component: ShipmentUpdate,
    exact: true,
  },
  {
    path: ROUTE_SHIPMENT_MANIFEST_DETAILS,
    Component: ShipmentManifestDetails,
    exact: true,
  },
  {
    path: ROUTE_SETTINGS,
    Component: SolversList,
    exact: true,
  },
  {
    path: '/',
    Component: Dashboard,
    exact: true,
  },
];

export default routes;
