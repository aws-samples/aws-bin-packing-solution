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
using System.Threading.Tasks;
using Amazon.Lambda.Core;
using Amazon.Lambda.Serialization.SystemTextJson;
using Amazon.XRay.Recorder.Core;
using Amazon.XRay.Recorder.Handlers.AwsSdk;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
//#define ISLOCAL

// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.
[assembly: LambdaSerializer(typeof(DefaultLambdaJsonSerializer))]

namespace AWS.Prototyping.Pacman.Solver;

public class Function
{
    public static void Main(string[] args)
    {
        var eventArgs = new Dictionary<string, string>();
        eventArgs["ManifestId"] = "b4b202b7-69e3-4f3d-be52-043017ec12a5";
        new Function().FunctionHandler(eventArgs, null).GetAwaiter()
            .GetResult();
    }


    /// <summary>
    ///     A simple function that takes a string and does a ToUpper
    /// </summary>
    /// <param name="input"></param>
    /// <param name="context"></param>
    /// <returns></returns>
    public async Task FunctionHandler(Dictionary<string,string> invokeEvent, ILambdaContext context)
    {
        AWSSDKHandler.RegisterXRayForAllServices();
        bool isRunningInLambda = context != null;
        
        if (!isRunningInLambda)
        AWSXRayRecorder.Instance.BeginSegment("EB AFIT Solver");

        Console.WriteLine($"Received event argument {JsonConvert.SerializeObject(invokeEvent)}");

         if (!invokeEvent.ContainsKey("ManifestId"))
             throw new Exception("Manifest ID is missing from input.");

         //var ManifestId = "78189117-fea3-42be-8f14-7b844a8da301";
         if (string.IsNullOrEmpty(invokeEvent["ManifestId"]))
             throw new Exception("Manifest ID cannot be blank or null.");

         var ManifestId = invokeEvent["ManifestId"];

         await PackingService.ExecutePack(ManifestId);
    
        if  (!isRunningInLambda)
             AWSXRayRecorder.Instance.EndSegment();
       
    }
}