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

using System.Runtime.Serialization;

namespace AWS.Prototyping.Pacman.Solver.Entities;

/// <summary>
///     An item to be packed. Also used to hold post-packing details for the item.
/// </summary>
[DataContract]
public class Item
{
    #region Constructors

    /// <summary>
    ///     Initializes a new instance of the Item class.
    /// </summary>
    /// <param name="id">The item ID.</param>
    /// <param name="dim1">The length of one of the three item dimensions.</param>
    /// <param name="dim2">The length of another of the three item dimensions.</param>
    /// <param name="dim3">The length of the other of the three item dimensions.</param>
    /// <param name="itemQuantity">The item quantity.</param>
    public Item(string id, double dim1, double dim2, double dim3, int quantity, string ItemTypeId,string[] requiredFeatures,double weight)
    {
        ID = id;
        Dim1 = dim1;
        Dim2 = dim2;
        Dim3 = dim3;
        Volume = dim1 * dim2 * dim3;
        Quantity = quantity;
        this.ItemTypeId = ItemTypeId;
        this.RequiredFeatures = requiredFeatures;
        this.Weight = weight;
    }

    #endregion Constructors

    #region Private Variables

    #endregion Private Variables

    #region Public Properties

    /// <summary>
    ///     Gets or sets the item ID.
    /// </summary>
    /// <value>
    ///     The item ID.
    /// </value>
    [DataMember]
    public string ID { get; set; }

    /// <summary>
    ///     Gets or sets a value indicating whether this item has already been packed.
    /// </summary>
    /// <value>
    ///     True if the item has already been packed; otherwise, false.
    /// </value>
    [DataMember]
    public bool IsPacked { get; set; }

    /// <summary>
    ///     Gets or sets the length of one of the item dimensions.
    /// </summary>
    /// <value>
    ///     The first item dimension.
    /// </value>
    [DataMember]
    public double Dim1 { get; set; }

    /// <summary>
    ///     Gets or sets the length another of the item dimensions.
    /// </summary>
    /// <value>
    ///     The second item dimension.
    /// </value>
    [DataMember]
    public double Dim2 { get; set; }

    /// <summary>
    ///     Gets or sets the third of the item dimensions.
    /// </summary>
    /// <value>
    ///     The third item dimension.
    /// </value>
    [DataMember]
    public double Dim3 { get; set; }

    /// <summary>
    ///     Gets or sets the x coordinate of the location of the packed item within the container.
    /// </summary>
    /// <value>
    ///     The x coordinate of the location of the packed item within the container.
    /// </value>
    [DataMember]
    public double CoordX { get; set; }

    /// <summary>
    ///     Gets or sets the y coordinate of the location of the packed item within the container.
    /// </summary>
    /// <value>
    ///     The y coordinate of the location of the packed item within the container.
    /// </value>
    [DataMember]
    public double CoordY { get; set; }

    /// <summary>
    ///     Gets or sets the z coordinate of the location of the packed item within the container.
    /// </summary>
    /// <value>
    ///     The z coordinate of the location of the packed item within the container.
    /// </value>
    [DataMember]
    public double CoordZ { get; set; }

    /// <summary>
    ///     Gets or sets the item quantity.
    /// </summary>
    /// <value>
    ///     The item quantity.
    /// </value>
    public int Quantity { get; set; }

    /// <summary>
    ///     Gets or sets the x dimension of the orientation of the item as it has been packed.
    /// </summary>
    /// <value>
    ///     The x dimension of the orientation of the item as it has been packed.
    /// </value>
    [DataMember]
    public double PackDimX { get; set; }

    /// <summary>
    ///     Gets or sets the y dimension of the orientation of the item as it has been packed.
    /// </summary>
    /// <value>
    ///     The y dimension of the orientation of the item as it has been packed.
    /// </value>
    [DataMember]
    public double PackDimY { get; set; }

    /// <summary>
    ///     Gets or sets the z dimension of the orientation of the item as it has been packed.
    /// </summary>
    /// <value>
    ///     The z dimension of the orientation of the item as it has been packed.
    /// </value>
    [DataMember]
    public double PackDimZ { get; set; }

    /// <summary>
    ///     Gets the item volume.
    /// </summary>
    /// <value>
    ///     The item volume.
    /// </value>
    [DataMember]
    public double Volume { get; }

    [DataMember] public string ItemTypeId { get; set; }
    
    [DataMember] public string[] RequiredFeatures { get; set; }
    
    [DataMember] public double Weight { get; set; }

    #endregion Public Properties
}