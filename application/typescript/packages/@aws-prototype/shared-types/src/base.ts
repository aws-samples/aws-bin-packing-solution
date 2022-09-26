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

/**
 * ResourceTag can be used to assign metadata. <br/>
 * Each tag is a label consisting of a user-defined key and value.
 */
export interface ResourceTag {
  name: string;
  value: string;
}

/**
 * Specified the dimension of a item or a container.
 */
export interface Dimension {
  width: number;
  length: number;
  height: number;
}

/**
 * Specified the coordinate of a item inside its assigned container - The coordinate is the central point of the item related to the central point of the container.
 */
export interface Coordinate {
  x: number;
  y: number;
  z: number;
}

/**
 * The based object type of entities inside this application.
 */
export interface SolutionObjectBase {
  Id?: string;
  name: string;
  description?: string;
  tags?: ResourceTag[];
}
