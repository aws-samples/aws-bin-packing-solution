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

using System.Collections.Generic;
using System.Runtime.Serialization;

namespace AWS.Prototyping.Pacman.Solver.Entities;

/// <summary>
///     The container packing result.
/// </summary>
[DataContract]
public class ContainerPackingResult
{
    #region Constructors

    public ContainerPackingResult()
    {
        AlgorithmPackingResults = new List<AlgorithmPackingResult>();
    }

    #endregion Constructors

    #region Public Properties

    /// <summary>
    ///     Gets or sets the container ID.
    /// </summary>
    /// <value>
    ///     The container ID.
    /// </value>
    [DataMember]
    public string ContainerID { get; set; }

    [DataMember] public List<AlgorithmPackingResult> AlgorithmPackingResults { get; set; }

    #endregion Public Properties
}