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

[DataContract]
public class AlgorithmPackingResult
{
    #region Constructors

    public AlgorithmPackingResult()
    {
        PackedItems = new List<Item>();
        UnpackedItems = new List<Item>();
    }

    #endregion Constructors

    #region Public Properties

    [DataMember] public int AlgorithmID { get; set; }

    [DataMember] public string AlgorithmName { get; set; }

    /// <summary>
    ///     Gets or sets a value indicating whether all of the items are packed in the container.
    /// </summary>
    /// <value>
    ///     True if all the items are packed in the container; otherwise, false.
    /// </value>
    [DataMember]
    public bool IsCompletePack { get; set; }

    /// <summary>
    ///     Gets or sets the list of packed items.
    /// </summary>
    /// <value>
    ///     The list of packed items.
    /// </value>
    [DataMember]
    public List<Item> PackedItems { get; set; }

    /// <summary>
    ///     Gets or sets the elapsed pack time in milliseconds.
    /// </summary>
    /// <value>
    ///     The elapsed pack time in milliseconds.
    /// </value>
    [DataMember]
    public long PackTimeInMilliseconds { get; set; }

    /// <summary>
    ///     Gets or sets the percent of container volume packed.
    /// </summary>
    /// <value>
    ///     The percent of container volume packed.
    /// </value>
    [DataMember]
    public double PercentContainerVolumePacked { get; set; }

    /// <summary>
    ///     Gets or sets the percent of item volume packed.
    /// </summary>
    /// <value>
    ///     The percent of item volume packed.
    /// </value>
    [DataMember]
    public double PercentItemVolumePacked { get; set; }

    /// <summary>
    ///     Gets or sets the list of unpacked items.
    /// </summary>
    /// <value>
    ///     The list of unpacked items.
    /// </value>
    [DataMember]
    public List<Item> UnpackedItems { get; set; }

    #endregion Public Properties
}