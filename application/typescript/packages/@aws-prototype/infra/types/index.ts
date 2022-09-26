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
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { CloudFrontWebDistribution } from 'aws-cdk-lib/aws-cloudfront';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

export type ApiLambdaConstructProps = {
  readonly CognitoUserPool: cognito.UserPool;
  readonly CognitoAppClient: cognito.UserPoolClient;
  readonly ContainerTypeTable: dynamodb.Table;
  readonly ItemTypeTable: dynamodb.Table;
  readonly ShipmentsTable: dynamodb.Table;
  readonly TagsTable: dynamodb.Table;
  readonly ManifestTable: dynamodb.Table;
  readonly ManifestsShipmentIdIndex: string;
  readonly StorageBucket: s3.Bucket;
  readonly EBAFITSolverFunction: lambda.Function;
  readonly SolverLambdaArnSsmParamName: string;
  readonly PackingContainersTable: dynamodb.Table;
  readonly PackingItemsTable: dynamodb.Table;
  readonly PackingContainersManifestIdIndex: string;
  readonly PackingItemsManifestIdIndex: string;
};

export type SolverLambdaConstructProps = {
  readonly CognitoUserPool: cognito.UserPool;
  readonly CognitoAppClient: cognito.UserPoolClient;
  readonly ContainerTypeTable: dynamodb.Table;
  readonly ItemTypeTable: dynamodb.Table;
  readonly ShipmentsTable: dynamodb.Table;
  readonly TagsTable: dynamodb.Table;
  readonly ManifestTable: dynamodb.Table;
  readonly StorageBucket: s3.Bucket;
  readonly PackingContainersTable: dynamodb.Table;
  readonly PackingItemsTable: dynamodb.Table;
  readonly PackingContainersManifestIdIndex: string;
  readonly PackingItemsManifestIdIndex: string;
};

export type ApiConstructProps = ApiLambdaConstructProps & { APIFunction: lambda.Function };
