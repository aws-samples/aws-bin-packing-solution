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
import { SolutionObjectBase } from './base';

/**
 * Specified the items (how many with what item type) to be packed.
 */
export interface ShipmentItem {
  /**
   * The id of the item type.
   */
  itemTypeId: string;
  /**
   * The number of items in this item type.
   */
  quantity: number;
}

/**
 * Specified the containers (how many with what container type) can be used in packing.
 */
export interface ShipmentContainer {
  /**
   * The id of the container type.
   */
  containerTypeId: string;
  /**
   * The number of available containers in this container type.
   */
  quantity: number;
  /**
   * The cost of this container type based on the shipment spec. <br/>
   * This is used to calculate the score in the solution to find the optimal solution. <br/>
   * This may vary from destination or time period.
   */
  cost: number;
}

/**
 * Specified a shipment where the packing is for.
 */
export interface Shipment extends SolutionObjectBase {
  /**
   * The items to be packed.
   */
  items: ShipmentItem[];
  /**
   * The containers can be used in this shipment.
   */
  containers: ShipmentContainer[];
}
