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
using System.Diagnostics;
using System.Linq;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;
using Amazon.XRay.Recorder.Core;
using AWS.Prototyping.Pacman.Solver.Algorithms;
using AWS.Prototyping.Pacman.Solver.DataMappers;
using AWS.Prototyping.Pacman.Solver.Entities;

namespace AWS.Prototyping.Pacman.Solver;

/// <summary>
///     The container packing service.
/// </summary>
public static class PackingService
{
    // The duration, in seconds, where there is no result improvement before the process quits 
    private static int NO_IMPROVE_PERMUTATIONS = 15;

     static PackingService()
    {
        if (Environment.GetEnvironmentVariable("MaximumPermutations") != null)
        {
            int maxPerm;
            if (int.TryParse(Environment.GetEnvironmentVariable("MaximumPermutations"), out maxPerm))
                NO_IMPROVE_PERMUTATIONS = maxPerm;
        }
    }
    public static async Task ExecutePack(string ManifestId)
    {
        AWSXRayRecorder.Instance.BeginSubsegment($"Packing manifest ID {ManifestId}");
        var mapper = new DynamoToEntityMapper();
        try
        {
            var manifest = await mapper.GetManifestById(ManifestId);

            var containers = await mapper.GetContainersForManifest(ManifestId);
            containers = containers.ToList();
            var items = await mapper.GetItemsForManifest(ManifestId);

            var lstAlgos = new List<int>(new[] {(int) AlgorithmType.EB_AFIT});


            PackingResult mostOptimalResult = null;

            long computeStartTimestamp = DateTimeOffset.UnixEpoch.ToUnixTimeMilliseconds();
            int permutationsSinceLastImprovement= 0;

            
            // Cancels all loops down the stack
            CancellationTokenSource cts = new CancellationTokenSource();

            // Permutation is very processor intensive
            // But it's good for processing optimal solutions
            
            var permutatedContainerList = containers.Permute();
            
            // Just use one container list combination to reduce processor load
            //var permutatedContainerList = new List < List < Container >> ();
           // permutatedContainerList.Add(containers);
            
            
            
            try
            {
                foreach (var shuffledContainerList in permutatedContainerList)
                {
                    
                        if (permutationsSinceLastImprovement >
                            NO_IMPROVE_PERMUTATIONS)
                        {
                            Console.WriteLine(
                                $"No improvement in solver score after {permutationsSinceLastImprovement} permutations, exiting.");
                            cts.Cancel();

                            break;
                        }

                        
                        var shuffledPackResult = PackManifest(shuffledContainerList.ToList(), items, lstAlgos, cts.Token);
                        

                        if (mostOptimalResult == null)
                            mostOptimalResult = shuffledPackResult;
                        else
                        {
                            // Get the total cost of the solution
                            var costOfPackedContainers = containers
                                .Where(c => shuffledPackResult.Results.Any(x => x.ContainerID == c.ID))
                                .Sum(x => x.Cost);

                            var costOfOptimalResult = containers
                                .Where(c => shuffledPackResult.Results.Any(x => x.ContainerID == c.ID))
                                .Sum(x => x.Cost);
                            
                            Console.WriteLine($"Total cost of containers for this permutation: ${costOfPackedContainers}");

                            if (costOfOptimalResult > costOfPackedContainers)
                            {
                                mostOptimalResult = shuffledPackResult;
                                permutationsSinceLastImprovement = 0;
                            }
                            else
                            {
                                permutationsSinceLastImprovement++;
                            }
                        }
                    
                } 

            }
            catch (OperationCanceledException e)
            {
                Console.WriteLine(e.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                AWSXRayRecorder.Instance.AddException(ex);
                throw;
            }
            finally
            {
                cts.Dispose();
            }

            var totalComputeMilliseconds = DateTimeOffset.UnixEpoch.ToUnixTimeMilliseconds() - computeStartTimestamp;

            Console.WriteLine($"Computed permutations in {totalComputeMilliseconds} ms");

            if (mostOptimalResult != null)
            {
                Console.WriteLine("Most optimal solution:");
                foreach (var result in mostOptimalResult.Results)
                    PrintPackingResult(result.ContainerID, result.AlgorithmPackingResults[0]);
                await mapper.SaveManifest(manifest.Id, mostOptimalResult.Results, mostOptimalResult.UnpackedItems);
            }
            else
            {
                Console.WriteLine("Could not find a solution.");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"An exception occurred trying to pack manifest ID {ManifestId}: {ex.Message} Stack Trace: {ex.StackTrace}");
            await mapper.SaveErrorManifest(ManifestId);
        }

        AWSXRayRecorder.Instance.EndSubsegment();
    }

    private static void PrintPackingResult(string ContainerId,AlgorithmPackingResult packingResult)
    {
        
        Console.WriteLine($"Container {ContainerId}");
        Console.WriteLine("-----------------------------");
        Console.WriteLine($"Packed Volume: {packingResult.PercentContainerVolumePacked}");
        Console.WriteLine("Packed Items:");
        foreach (var packedItem in packingResult.PackedItems)
            Console.WriteLine(
                $"Item {packedItem.ID} packed in container {ContainerId} at {packedItem.CoordX} x {packedItem.CoordY} x {packedItem.CoordZ}");

    }

    public class PackingResult
    {
        public PackingResult()
        {
            
        }

        public PackingResult(List<ContainerPackingResult> Results, List<Item> UnpackedItems)
        {
            this.Results = Results;
            this.UnpackedItems = UnpackedItems;
        }
        public List<ContainerPackingResult> Results { get; set; }

        public List<Item> UnpackedItems { get; set; }
    }

    
    private static  PackingResult PackManifest(List<Container> containers,List<Item> items,List<int> algos,CancellationToken ct)
    {
        AWSXRayRecorder.Instance.BeginSubsegment($"Packing Manifset with {containers.Count} containers and {items.Count} items.");
        
        var unpackedItems = new List<Item>();

        var packingResults = new List<ContainerPackingResult>();

        // Pack items one at a time
        foreach (var container in containers)
        {
           

            if (ct.IsCancellationRequested)
                break;
            
            var containerDummyList = new List<Container>();
            containerDummyList.Add(container);
            var results = Pack(containerDummyList, items, algos,ct);
            // We only expect 1 result because we only pass in 1 container
            var containerResult = results[0];
            var packingResult = containerResult.AlgorithmPackingResults[0];

            packingResults.Add(containerResult);

            PrintPackingResult(container.ID,packingResult);
            
            unpackedItems = packingResult.UnpackedItems;

            // No more items to pack
            if (packingResult.UnpackedItems.Count == 0)
                break;
            
            items = packingResult.UnpackedItems;
            
        }
        AWSXRayRecorder.Instance.EndSubsegment();
        
        return new PackingResult(packingResults,unpackedItems);

        // await mapper.SaveManifest(manifest.Id, packingResults, unpackedItems);
    }

    /// <summary>
    ///     Attempts to pack the specified containers with the specified items using the specified algorithms.
    /// </summary>
    /// <param name="containers">The list of containers to pack.</param>
    /// <param name="itemsToPack">The items to pack.</param>
    /// <param name="algorithmTypeIDs">The list of algorithm type IDs to use for packing.</param>
    /// <returns>A container packing result with lists of the packed and unpacked items.</returns>
    private static List<ContainerPackingResult> Pack(List<Container> containers, List<Item> itemsToPack,
        List<int> algorithmTypeIDs,CancellationToken ct)
    {
        var sync = new object();
        var result = new List<ContainerPackingResult>();

        Parallel.ForEach(containers,new ParallelOptions(){CancellationToken = ct}, container =>
        {
            var containerPackingResult = new ContainerPackingResult();
            containerPackingResult.ContainerID = container.ID;

            Parallel.ForEach(algorithmTypeIDs,new ParallelOptions(){MaxDegreeOfParallelism = Environment.ProcessorCount,CancellationToken = ct}, algorithmTypeID =>
            {
                var algorithm = GetPackingAlgorithmFromTypeID(algorithmTypeID);

                // Until I rewrite the algorithm with no side effects, we need to clone the item list
                // so the parallel updates don't interfere with each other.
                var items = new List<Item>();

                itemsToPack.ForEach(item =>
                {
                    items.Add(new Item(item.ID, item.Dim1, item.Dim2, item.Dim3, item.Quantity, item.ItemTypeId,item.RequiredFeatures,item.Weight));
                });

                var stopwatch = new Stopwatch();
                stopwatch.Start();
                var algorithmResult = algorithm.Run(container, items,ct );
                stopwatch.Stop();

                algorithmResult.PackTimeInMilliseconds = stopwatch.ElapsedMilliseconds;

                var containerVolume = container.Length * container.Width * container.Height;
                var itemVolumePacked = algorithmResult.PackedItems.Sum(i => i.Volume);
                var itemVolumeUnpacked = algorithmResult.UnpackedItems.Sum(i => i.Volume);

                algorithmResult.PercentContainerVolumePacked = Math.Round(itemVolumePacked / containerVolume * 100, 2);
                algorithmResult.PercentItemVolumePacked =
                    Math.Round(itemVolumePacked / (itemVolumePacked + itemVolumeUnpacked) * 100, 2);

                lock (sync)
                {
                    containerPackingResult.AlgorithmPackingResults.Add(algorithmResult);
                }
            });

            containerPackingResult.AlgorithmPackingResults = containerPackingResult.AlgorithmPackingResults
                .OrderBy(r => r.AlgorithmName).ToList();

            lock (sync)
            {
                result.Add(containerPackingResult);
            }
            
          
        });

        return result;
    }

    /// <summary>
    ///     Gets the packing algorithm from the specified algorithm type ID.
    /// </summary>
    /// <param name="algorithmTypeID">The algorithm type ID.</param>
    /// <returns>An instance of a packing algorithm implementing AlgorithmBase.</returns>
    /// <exception cref="System.Exception">Invalid algorithm type.</exception>
    public static IPackingAlgorithm GetPackingAlgorithmFromTypeID(int algorithmTypeID)
    {
        switch (algorithmTypeID)
        {
            case (int) AlgorithmType.EB_AFIT:
                return new EB_AFIT();

            default:
                throw new Exception("Invalid algorithm type.");
        }
    }
}