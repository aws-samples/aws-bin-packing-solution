// Original Copyright 2019 David Chapman. Licensed under the MIT License.
// Modifications Copyright 2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.

using System.Runtime.Serialization;

namespace AWS.Prototyping.Pacman.Solver.Algorithms;

[DataContract]
public enum AlgorithmType
{
    /// <summary>
    ///     The EB-AFIT packing algorithm type.
    /// </summary>
    [DataMember] EB_AFIT = 1
}