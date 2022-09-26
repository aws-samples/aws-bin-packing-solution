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
import { SideNavigationItemType } from 'aws-northstar/components/SideNavigation';
import { ROUTE_SETTINGS, ROUTE_CONTAINER_TYPE_LIST, ROUTE_ITEM_TYPE_LIST, ROUTE_SHIPMENT_LIST } from './routes';

const navigationTemplate = [
  {
    type: SideNavigationItemType.LINK,
    text: 'Shipments',
    href: ROUTE_SHIPMENT_LIST,
  },
  {
    type: SideNavigationItemType.LINK,
    text: 'Container Types',
    href: ROUTE_CONTAINER_TYPE_LIST,
  },
  {
    type: SideNavigationItemType.LINK,
    text: 'Item Types',
    href: ROUTE_ITEM_TYPE_LIST,
  },
  {
    type: SideNavigationItemType.DIVIDER,
  },
  {
    type: SideNavigationItemType.LINK,
    text: 'Settings',
    href: ROUTE_SETTINGS,
  },
];

export default navigationTemplate;
