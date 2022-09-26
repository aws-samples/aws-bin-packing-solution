// Original Copyright 2019 David Chapman. Licensed under the MIT License.
// Modifications Copyright 2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.

using System.Collections.Generic;
using AWS.Prototyping.Pacman.Solver.Entities;

namespace AWS.Prototyping.Pacman.Solver.Algorithms;

public abstract class AlgorithmBase
{
    public abstract ContainerPackingResult Run(Container container, List<Item> items);
}