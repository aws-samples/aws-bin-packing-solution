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
import { ManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { CfnOutput, Duration, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiLambdaConstructProps } from '../../../types';
import * as permissionUtils from '../../../utils/Permissions';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

export default class ApiProxyLambdaConstruct extends Construct {
  readonly APIFunction: lambda.Function;

  constructor(scope: Construct, id: string, props: ApiLambdaConstructProps) {
    super(scope, id);

    this.APIFunction = this.buildLambda(path.join(__dirname, '../../../../api/src/index.ts'), props);

    if (this.APIFunction.role) {
      props.EBAFITSolverFunction.grantInvoke(this.APIFunction.role);

      permissionUtils.default.addDynamoDbPermissions(props.ManifestTable, this.APIFunction.role);

      permissionUtils.default.addDynamoDbPermissions(props.ItemTypeTable, this.APIFunction.role);

      permissionUtils.default.addDynamoDbPermissions(props.ContainerTypeTable, this.APIFunction.role);

      permissionUtils.default.addDynamoDbPermissions(props.TagsTable, this.APIFunction.role);

      permissionUtils.default.addDynamoDbPermissions(props.ShipmentsTable, this.APIFunction.role);

      permissionUtils.default.addDynamoDbPermissions(props.PackingContainersTable, this.APIFunction.role);

      permissionUtils.default.addDynamoDbPermissions(props.PackingItemsTable, this.APIFunction.role);

      this.APIFunction.role.addManagedPolicy(
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      );

      this.APIFunction.role.addToPrincipalPolicy(
        PolicyStatement.fromJson({
          Effect: 'Allow',
          Action: ['lambda:InvokeFunction', 'lambda:ListTags'],
          Resource: `arn:aws:lambda:${Stack.of(this).region}:${Stack.of(this).account}:function:*`,
        }),
      );

      this.APIFunction.role.addToPrincipalPolicy(
        PolicyStatement.fromJson({
          Effect: 'Allow',
          Action: ['lambda:ListFunctions'],
          Resource: '*',
        }),
      );

      this.APIFunction.role.addToPrincipalPolicy(
        PolicyStatement.fromJson({
          Effect: 'Allow',
          Action: ['ssm:GetParameter'],
          Resource: `arn:aws:ssm:${Stack.of(this).region}:${Stack.of(this).account}:*`,
        }),
      );

      this.APIFunction.role.addToPrincipalPolicy(
        PolicyStatement.fromJson({
          Effect: 'Allow',
          Action: ['ssm:PutParameter'],
          Resource: `arn:aws:ssm:${Stack.of(this).region}:${Stack.of(this).account}:*`,
        }),
      );

      this.APIFunction.role.addToPrincipalPolicy(
        PolicyStatement.fromJson({
          Effect: 'Allow',
          Action: ['tag:GetResources'],
          Resource: '*',
        }),
      );

      props.StorageBucket.grantReadWrite(this.APIFunction.role);
    }

    new CfnOutput(this, 'API Lambda ARN', {
      value: this.APIFunction.functionArn,
      description: 'API Lambda ARN',
      exportName: 'API-Lambda-ARN',
    });
  }

  private buildLambda(path: string, props: ApiLambdaConstructProps) {
    const Fn = new NodejsFunction(this, 'dataApiHandlerFn', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'handler',
      entry: path,
      timeout: Duration.seconds(10),
      memorySize: 256,
      environment: {
        AWSAccount: Stack.of(this).account,
        AWSRegion: Stack.of(this).region,
        CognitoPoolId: props.CognitoUserPool.userPoolId,
        CognitoAppClientId: props.CognitoAppClient.userPoolClientId,
        ManifestTable: props.ManifestTable.tableName,
        ManifestsShipmentIdIndex: props.ManifestsShipmentIdIndex,
        ItemTypeTable: props.ItemTypeTable.tableName,
        ContainerTypeTable: props.ContainerTypeTable.tableName,
        ShipmentTable: props.ShipmentsTable.tableName,
        TagsTable: props.TagsTable.tableName,
        SolverLambdaFunction: props.EBAFITSolverFunction.functionArn,
        StorageBucket: props.StorageBucket.bucketName,
        SolverLambdaArnSsmParamName: props.SolverLambdaArnSsmParamName,
        PackingContainersTable: props.PackingContainersTable.tableName,
        PackingItemsTable: props.PackingItemsTable.tableName,
        PackingItemsManifestIdIndex: props.PackingItemsManifestIdIndex,
        PackingContainersManifestIdIndex: props.PackingContainersManifestIdIndex,
      },
      tracing: lambda.Tracing.ACTIVE,
    });
    return Fn;
  }
}
