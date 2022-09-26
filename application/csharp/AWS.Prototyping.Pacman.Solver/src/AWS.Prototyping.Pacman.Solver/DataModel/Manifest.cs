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

using System;
using System.Collections.Generic;
using Amazon.DynamoDBv2.DataModel;

namespace AWS.Prototyping.Pacman.Solver.DataModel;

[DynamoDBTable("Manifest")]
public class Manifest
{
    [DynamoDBHashKey] public string Id { get; set; }


    [DynamoDBProperty("createdAt")] public DateTime? CreatedAt { get; set; }
    
    [DynamoDBProperty("updatedAt")] public DateTime? UpdatedAt { get; set; }
    

    [DynamoDBProperty("softScore")] public int SoftScore { get; set; }

    [DynamoDBProperty("hardScore")] public int HardScore { get; set; }

    [DynamoDBProperty("status")] public string status { get; set; }

    [DynamoDBProperty("shipmentId")] public string ShipmentId { get; set; }

    [DynamoDBProperty("packingContainers")]
    public List<PackingContainer> PackingContainers { get; set; }

    [DynamoDBProperty("packingItems")] public List<PackingItem> PackingItems { get; set; }

    [DynamoDBProperty("totalCost")] public double TotalCost { get; set; }

    [DynamoDBProperty("items")] public List<ShipmentItem> Items { get; set; }

    [DynamoDBProperty("containers")] public List<ShipmentContainer> Containers { get; set; }

    [DynamoDBProperty("unpackedItems")] public List<UnpackedItem> UnpackedItems { get; set; }
}

public class UnpackedItem
{
    [DynamoDBProperty("itemTypeId")] public string ItemTypeId { get; set; }
    [DynamoDBProperty("quantity")] public int Quantity { get; set; }
}