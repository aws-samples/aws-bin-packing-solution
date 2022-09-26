// Original Copyright 2019 David Chapman. Licensed under the MIT License.
// Modifications Copyright 2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.

using System.Collections.Generic;
using System.Threading;
using AWS.Prototyping.Pacman.Solver.Entities;

namespace AWS.Prototyping.Pacman.Solver.Algorithms;

/// <summary>
///     Interface for the packing algorithms in this project.
/// </summary>
public interface IPackingAlgorithm
{
    /// <summary>
    ///     Runs the algorithm on the specified container and items.
    /// </summary>
    /// <param name="container">The container.</param>
    /// <param name="items">The items to pack.</param>
    /// <returns>The algorithm packing result.</returns>
    AlgorithmPackingResult Run(Container container, List<Item> items,CancellationToken ct);
}