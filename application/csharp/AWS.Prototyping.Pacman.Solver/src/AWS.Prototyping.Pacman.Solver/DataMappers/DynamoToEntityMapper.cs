/**********************************************************************************************************************
* Licensed to the Apache Software Foundation (ASF) under one or more contributor license agreements.  See the NOTICE 
* file distributed with this work for additional information regarding copyright ownership.  The ASF licenses this 
file to you under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the License for the
specific language governing permissions and limitations under the License.  
 **********************************************************************************************************************/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using AWS.Prototyping.Pacman.Solver.DataModel;
using AWS.Prototyping.Pacman.Solver.Entities;

namespace AWS.Prototyping.Pacman.Solver.DataMappers;

public class DynamoToEntityMapper
{
    private static readonly List<Container> Containers = new();
    private static readonly List<Item> Items = new();
    private readonly AmazonDynamoDBClient client;
    private readonly DynamoDBContext dynamoDbContext;

    public DynamoToEntityMapper()
    {
        client = new AmazonDynamoDBClient();
        dynamoDbContext = new DynamoDBContext(client);
    }

    private string? ManifestTableName =>
        Environment.GetEnvironmentVariable("ManifestTable");

    private string? ItemTypeTable =>
        Environment.GetEnvironmentVariable("ItemTypeTable");

    private string? ContainerTypeTable =>
        Environment.GetEnvironmentVariable("ContainerTypeTable");

    private string? ShipmentTableName =>
        Environment.GetEnvironmentVariable("ShipmentTable");

    private string? PackingContainersTable => Environment.GetEnvironmentVariable("PackingContainersTable");

    private string? PackingItemsTable => Environment.GetEnvironmentVariable("PackingItemsTable");


    private void convertContainers(ContainerType containerType, ShipmentContainer shipmentContainer)
    {
        for (var i = 0; i < shipmentContainer.Quantity; i++)
            Containers.Add(new Container(Guid.NewGuid().ToString(),
                containerType.Dimension.Length,
                containerType.Dimension.Height,
                containerType.Dimension.Width, containerType.Id, shipmentContainer.Cost, containerType.MaxWeight)
            {
                Features = containerType.Features
            });
    }

    private void convertPackages(ItemType itemType, ShipmentItem shipmentItem)
    {
        for (var i = 0; i < shipmentItem.Quantity; i++)
        {
            var newItem = new Item(Guid.NewGuid().ToString(),
                itemType.Dimension.Length,
                itemType.Dimension.Height,
                itemType.Dimension.Width, 1, itemType.Id, itemType.RequiredFeatures, itemType.Weight);
            Items.Add(newItem);
        }
    }

    public async Task<List<Item>> GetItemsForManifest(string ManifestId)
    {
        var config = new DynamoDBOperationConfig {OverrideTableName = ManifestTableName};
        var manifest = await dynamoDbContext.LoadAsync<Manifest>(ManifestId, config);

        if (manifest == null)
            throw new Exception($"Manifest with ID {ManifestId} was not found.");

        config.OverrideTableName = ShipmentTableName;
        var shipment = await dynamoDbContext.LoadAsync<Shipment>(manifest.ShipmentId, config);

        if (shipment == null)
            throw new Exception($"Shipment with ID {manifest.ShipmentId} was not found.");

        config.OverrideTableName = ItemTypeTable;

        Items.Clear();

        shipment.Items.ForEach(shipmentItem =>
        {
            var itemType = dynamoDbContext.LoadAsync<ItemType>(shipmentItem.ItemTypeId, config).GetAwaiter()
                .GetResult();
            convertPackages(itemType, shipmentItem);
        });

        return Items;
    }

    public async Task<List<Container>> GetContainersForManifest(string ManifestId)
    {
        var config = new DynamoDBOperationConfig {OverrideTableName = ManifestTableName};

        var manifest = await dynamoDbContext.LoadAsync<Manifest>(ManifestId, config);

        if (manifest == null)
            throw new Exception($"Manifest with ID {ManifestId} was not found.");

        config.OverrideTableName = ShipmentTableName;

        var shipment = await dynamoDbContext.LoadAsync<Shipment>(manifest.ShipmentId, config);

        if (shipment == null)
            throw new Exception($"Shipment with ID {manifest.ShipmentId} was not found.");

        config.OverrideTableName = ContainerTypeTable;

        Containers.Clear();

        shipment.Containers.ForEach(shipmentContainer =>
        {
            var containerType = dynamoDbContext.LoadAsync<ContainerType>(shipmentContainer.ContainerTypeId, config)
                .GetAwaiter()
                .GetResult();
            convertContainers(containerType, shipmentContainer);
        });

        return Containers;
    }

    public async Task<Manifest> GetManifestById(string ManifestId)
    {
        var manifestConfig = new DynamoDBOperationConfig {OverrideTableName = ManifestTableName};

        var manifest = await dynamoDbContext.LoadAsync<Manifest>(ManifestId, manifestConfig);

        if (manifest == null)
            throw new Exception($"Manifest with ID {ManifestId} was not found.");

        return manifest;
    }

    public async Task SaveErrorManifest(string ManifestId)
    {
        var manifestConfig = new DynamoDBOperationConfig {OverrideTableName = ManifestTableName};

        var manifest = await dynamoDbContext.LoadAsync<Manifest>(ManifestId, manifestConfig);

        if (manifest == null)
            throw new Exception($"Manifest with ID {ManifestId} was not found.");

        manifest.status = "Error";

        await dynamoDbContext.SaveAsync(manifest, manifestConfig);
    }

    public async Task SaveManifest(string ManifestId, List<ContainerPackingResult> packingResults,
        List<Item> unpackedItems)
    {
        var manifestConfig = new DynamoDBOperationConfig {OverrideTableName = ManifestTableName};

        var packingItemsConfig = new DynamoDBOperationConfig {OverrideTableName = PackingItemsTable};

        var packingContainersConfig = new DynamoDBOperationConfig {OverrideTableName = PackingContainersTable};

        var containerTypeConfig = new DynamoDBOperationConfig {OverrideTableName = ContainerTypeTable};
        
        var manifest = await dynamoDbContext.LoadAsync<Manifest>(ManifestId, manifestConfig);

        if (manifest == null)
            throw new Exception($"Manifest with ID {ManifestId} was not found.");

        manifest.status = "Complete";
        manifest.PackingContainers = new List<PackingContainer>();
        manifest.PackingItems = new List<PackingItem>();
        manifest.UnpackedItems = new List<UnpackedItem>();
        manifest.TotalCost = 0;

        foreach (var result in packingResults)
        {
            var container = Containers.Find(a => a.ID == result.ContainerID);

            if (string.IsNullOrEmpty(container.ContainerTypeId))
                continue;

            var shipmentContainer = manifest.Containers.First(a => a.ContainerTypeId == container.ContainerTypeId);

            manifest.TotalCost += shipmentContainer.Cost;

            var packingContainer = new PackingContainer
            {
                Id = Guid.NewGuid().ToString(),
                ContainerTypeId = container.ContainerTypeId,
                PackedPercent = result.AlgorithmPackingResults[0].PercentContainerVolumePacked,
                ManifestId = manifest.Id
                //Tags = new List<ResourceTag>()
            };

            await dynamoDbContext.SaveAsync(packingContainer, packingContainersConfig);

            //manifest.PackingContainers.Add(packingContainer);

            foreach (var packResult in result.AlgorithmPackingResults)
            foreach (var packedItem in packResult.PackedItems.Where(a => !string.IsNullOrEmpty(a.ItemTypeId)))
            {
                // We need to translate the coordinates to be relative to the container
                // This is because we are using 0 as the midpoint, instead of the corner
                var xCoordinate = container.Length / 2 * -1 + packedItem.CoordX + packedItem.PackDimX / 2;
                var yCoordinate = container.Height / 2 * -1 + packedItem.CoordY + packedItem.PackDimY / 2;
                var zCoordinate = container.Width / 2 * -1 + packedItem.CoordZ + packedItem.PackDimZ / 2;
                var packingItem = new PackingItem
                {
                    Id = Guid.NewGuid().ToString(),
                    ContainerTypeId = container.ContainerTypeId,
                    Coordinates = new Coordinate {x = xCoordinate, y = yCoordinate, z = zCoordinate},
                    ItemTypeId = packedItem.ItemTypeId,
                    PackingContainerId = packingContainer.Id,
                    PackingDimension = new Dimension
                        {Length = packedItem.PackDimX, Height = packedItem.PackDimY, Width = packedItem.PackDimZ},
                    ManifestId = manifest.Id
                };

                await dynamoDbContext.SaveAsync(packingItem, packingItemsConfig);

                //manifest.PackingItems.Add(packingItem);
            }
        }

        foreach (var unpacked in unpackedItems.GroupBy(u => u.ItemTypeId))
            manifest.UnpackedItems.Add(new UnpackedItem
            {
                ItemTypeId = unpacked.Key,
                Quantity = unpacked.Count()
            });

        manifest.UpdatedAt = DateTime.UtcNow;

        await dynamoDbContext.SaveAsync(manifest, manifestConfig);
    }
}