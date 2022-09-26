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
import { Dimension, SolutionObjectBase } from './base';

/**
 * Specified a container type.
 */
export interface ContainerType extends SolutionObjectBase {
  /**
   * The maximum payload of the container in kg.
   */
  maxWeight: number;
  /**
   * The interior dimension of the container in mm.
   */
  dimension: Dimension;
  /**
   * The features supported by the container.
   */
  features?: string[];
}
