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

namespace AWS.Prototyping.Pacman.Solver.Entities;

/// <summary>
///     The container to pack items into.
/// </summary>
public class Container
{
    #region Constructors

    /// <summary>
    ///     Initializes a new instance of the Container class.
    /// </summary>
    /// <param name="id">The container ID.</param>
    /// <param name="length">The container length.</param>
    /// <param name="width">The container width.</param>
    /// <param name="height">The container height.</param>
    public Container(string id, double length, double width, double height, string ContainerTypeId,double Cost,double MaxWeight)
    {
        ID = id;
        Length = length;
        Width = width;
        Height = height;
        Volume = length * width * height;
        this.ContainerTypeId = ContainerTypeId;
        this.Cost = Cost;
        this.MaxWeight = MaxWeight;
    }

    #endregion Constructors

    #region Private Variables

    #endregion Private Variables

    #region Public Properties

    /// <summary>
    ///     Gets or sets the container ID.
    /// </summary>
    /// <value>
    ///     The container ID.
    /// </value>
    public string ID { get; set; }

    /// <summary>
    ///     Gets or sets the container length.
    /// </summary>
    /// <value>
    ///     The container length.
    /// </value>
    public double Length { get; set; }

    /// <summary>
    ///     Gets or sets the container width.
    /// </summary>
    /// <value>
    ///     The container width.
    /// </value>
    public double Width { get; set; }

    /// <summary>
    ///     Gets or sets the container height.
    /// </summary>
    /// <value>
    ///     The container height.
    /// </value>
    public double Height { get; set; }

    /// <summary>
    ///     Gets or sets the volume of the container.
    /// </summary>
    /// <value>
    ///     The volume of the container.
    /// </value>
    public double Volume { get; set; }

    public string ContainerTypeId { get; set; }

    public string[] Features { get; set; }

    public double Cost { get; set; }

    public double MaxWeight { get; set; }

    #endregion Public Properties
}