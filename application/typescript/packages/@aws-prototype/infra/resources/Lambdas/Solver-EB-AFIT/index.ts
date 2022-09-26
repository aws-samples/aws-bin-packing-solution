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
import { ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { CfnOutput, Duration, Stack, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NagSuppressions } from 'cdk-nag';
import { SolverLambdaConstructProps } from '../../../types';
import * as permissionUtils from '../../../utils/Permissions';
import * as path from 'path';

export default class SolverEBAFITLambdaConstruct extends Construct {
  readonly SolverFunction: lambda.Function;

  constructor(scope: Construct, id: string, props: SolverLambdaConstructProps) {
    super(scope, id);

    const dockerfile = path.join(
      __dirname,
      '../../../../../../../csharp/AWS.Prototyping.Pacman.Solver/src/AWS.Prototyping.Pacman.Solver',
    );

    this.SolverFunction = new lambda.DockerImageFunction(this, 'SolverEBAFITFunction', {
      code: lambda.DockerImageCode.fromImageAsset(dockerfile),
      tracing: lambda.Tracing.ACTIVE,
      memorySize: 10240,
      architecture: lambda.Architecture.X86_64,
      timeout: Duration.minutes(15),
      environment: {
        AWSAccount: Stack.of(this).account,
        AWSRegion: Stack.of(this).region,
        CognitoPoolId: props.CognitoUserPool.userPoolId,
        CognitoAppClientId: props.CognitoAppClient.userPoolClientId,
        ManifestTable: props.ManifestTable.tableName,
        ItemTypeTable: props.ItemTypeTable.tableName,
        ContainerTypeTable: props.ContainerTypeTable.tableName,
        ShipmentTable: props.ShipmentsTable.tableName,
        TagsTable: props.TagsTable.tableName,
        StorageBucket: props.StorageBucket.bucketName,
        MaximumPermutations: '3',
        PackingContainersTable: props.PackingContainersTable.tableName,
        PackingItemsTable: props.PackingItemsTable.tableName,
        PackingItemsManifestIdIndex: props.PackingItemsManifestIdIndex,
        PackingContainersManifestIdIndex: props.PackingContainersManifestIdIndex,
      },
    });

    Tags.of(this).add('Type', 'Solver');
    Tags.of(this).add('Name', 'EB AFIT Solver');

    if (this.SolverFunction.role) {
      permissionUtils.default.addDynamoDbPermissions(props.ManifestTable, this.SolverFunction.role);

      permissionUtils.default.addDynamoDbPermissions(props.ItemTypeTable, this.SolverFunction.role);

      permissionUtils.default.addDynamoDbPermissions(props.ContainerTypeTable, this.SolverFunction.role);

      permissionUtils.default.addDynamoDbPermissions(props.TagsTable, this.SolverFunction.role);

      permissionUtils.default.addDynamoDbPermissions(props.ShipmentsTable, this.SolverFunction.role);

      permissionUtils.default.addDynamoDbPermissions(props.PackingContainersTable, this.SolverFunction.role);

      permissionUtils.default.addDynamoDbPermissions(props.PackingItemsTable, this.SolverFunction.role);

      this.SolverFunction.role.addManagedPolicy(
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      );

      this.SolverFunction.role.addManagedPolicy(
        ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLambdaInsightsExecutionRolePolicy'),
      );

      NagSuppressions.addResourceSuppressions(this.SolverFunction.role, [
        {
          id: 'AwsSolutions-IAM4',
          reason: 'CloudWatchLambdaInsightsExecutionRolePolicy is required',
        },
      ]);

      props.StorageBucket.grantReadWrite(this.SolverFunction.role);
    }

    new CfnOutput(this, 'EB-AFIT Solver Lambda ARN', {
      value: this.SolverFunction.functionArn,
      description: 'EB-AFIT Solver Lambda ARN',
      exportName: 'EB-AFIT-Solver-Lambda-ARN',
    });
  }
}
