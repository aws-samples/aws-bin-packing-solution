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
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import StorageConstruct from '../resources/Storage';
import WebAppConstruct from '../resources/WebApp';
import IdentityConstructs from '../resources/Identity';
import DatabaseConstructs from '../resources/Database';
import ApiProxyLambdaConstruct from '../resources/Lambdas/Api';
import SolverEBAFITLambdaConstruct from '../resources/Lambdas/Solver-EB-AFIT';
import ApiConstruct from '../resources/Api';
import { ApiConstructProps, SolverLambdaConstructProps, ApiLambdaConstructProps } from '../types';
import SubscriptionLambdaConstruct from '../resources/Lambdas/Subscription';
import WebSocketConstruct from '../resources/WebSocket';
import CustomAuthorizerLambdaConstruct from '../resources/Lambdas/CustomAuthorizer';
import WebsiteIndexBuilderLambdaConstruct from '../resources/Lambdas/WebsiteIndexBuilder';
import WebAppDeploymentConstruct from '../resources/WebAppDeployment';
import { NagSuppressions } from 'cdk-nag';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class BinPackingSolutionStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const storageConstruct = new StorageConstruct(this, 'storage');

    const websiteIndexBuilderConstruct = new WebsiteIndexBuilderLambdaConstruct(this, 'websiteIndexBuilderHandler');

    const webAppConstruct = new WebAppConstruct(this, 'webApp', {
      webBucket: storageConstruct.webBucket,
    });

    const identityConstructs = new IdentityConstructs(this, 'identity', {
      uiWebDistribution: webAppConstruct.cfWeb,
    });

    const databaseConstructs = new DatabaseConstructs(this, 'databases');

    const solverLambdaProps: SolverLambdaConstructProps = {
      CognitoUserPool: identityConstructs.userPool,
      CognitoAppClient: identityConstructs.userPoolClient,
      ContainerTypeTable: databaseConstructs.ContainerTypeTable,
      ItemTypeTable: databaseConstructs.ItemTypeTable,
      ShipmentsTable: databaseConstructs.ShipmentsTable,
      TagsTable: databaseConstructs.TagsTable,
      ManifestTable: databaseConstructs.ManifestTable,
      StorageBucket: storageConstruct.storageBucket,
      PackingContainersTable: databaseConstructs.PackingContainersTable,
      PackingItemsTable: databaseConstructs.PackingItemsTable,
      PackingContainersManifestIdIndex: databaseConstructs.PackingContainersManifestIdIndex,
      PackingItemsManifestIdIndex: databaseConstructs.PackingItemsManifestIdIndex,
    };

    const ebafitSolverLambda = new SolverEBAFITLambdaConstruct(this, 'EBAFITSolverConstruct', solverLambdaProps);

    const solverLambdaArnSsmParameter = new ssm.StringParameter(this, 'solver-lambda-arn-param', {
      parameterName: 'solver-lambda-arn',
      stringValue: ebafitSolverLambda.SolverFunction.functionArn,
      type: ssm.ParameterType.STRING,
      tier: ssm.ParameterTier.STANDARD,
      simpleName: true,
    });

    const apiProxyLambdaProps: ApiLambdaConstructProps = {
      CognitoUserPool: identityConstructs.userPool,
      CognitoAppClient: identityConstructs.userPoolClient,
      ContainerTypeTable: databaseConstructs.ContainerTypeTable,
      ItemTypeTable: databaseConstructs.ItemTypeTable,
      ShipmentsTable: databaseConstructs.ShipmentsTable,
      TagsTable: databaseConstructs.TagsTable,
      ManifestTable: databaseConstructs.ManifestTable,
      ManifestsShipmentIdIndex: databaseConstructs.ManifestsShipmentIdIndex,
      StorageBucket: storageConstruct.storageBucket,
      EBAFITSolverFunction: ebafitSolverLambda.SolverFunction,
      SolverLambdaArnSsmParamName: solverLambdaArnSsmParameter.parameterName,
      PackingContainersTable: databaseConstructs.PackingContainersTable,
      PackingItemsTable: databaseConstructs.PackingItemsTable,
      PackingContainersManifestIdIndex: databaseConstructs.PackingContainersManifestIdIndex,
      PackingItemsManifestIdIndex: databaseConstructs.PackingItemsManifestIdIndex,
    };

    const apiProxyLambdaConstruct = new ApiProxyLambdaConstruct(this, 'apiProxy', apiProxyLambdaProps);

    const apiConstructProps: ApiConstructProps = {
      ...apiProxyLambdaProps,
      APIFunction: apiProxyLambdaConstruct.APIFunction,
    };

    const apiConstruct = new ApiConstruct(this, 'api', apiConstructProps);

    const webSocketConnectionHandler = new SubscriptionLambdaConstruct(this, 'webSocketConnectionHandler', {
      Mode: 'WEB_SOCKET_CONNECTION_HANDLER',
      SubscriptionsTable: databaseConstructs.SubscriptionTable,
      SubscriptionsConnectionIdIndex: databaseConstructs.SubscriptionsConnectionIdIndex,
    });

    const customAuthorizer = new CustomAuthorizerLambdaConstruct(this, 'customAuthorizerHandler', {
      CognitoUserPool: identityConstructs.userPool,
    });

    const webSocket = new WebSocketConstruct(this, 'webSocketApi', {
      WebSocketConnectionHandler: webSocketConnectionHandler.SubscriptionFunction,
      CustomAuthorizerHandler: customAuthorizer.CustomAuthorizerFunction,
    });

    new SubscriptionLambdaConstruct(this, 'dynamoDBStreamHandler', {
      Mode: 'DYNAMODB_STREAM_HANDLER',
      WebSocketURL: webSocket.WebSocketStage.url,
      WebSocketAPIId: webSocket.WebSocketApi.apiId,
      ManifestTable: databaseConstructs.ManifestTable,
      SubscriptionsTable: databaseConstructs.SubscriptionTable,
      SubscriptionsConnectionIdIndex: databaseConstructs.SubscriptionsConnectionIdIndex,
    });

    new WebAppDeploymentConstruct(this, 'webAppDeployment', {
      webBucket: storageConstruct.webBucket,
      websiteIndexBucket: storageConstruct.websiteIndexBucket,
      websiteIndexBuilderFunction: websiteIndexBuilderConstruct.WebsiteIndexBuilderFunction,
      api: apiConstruct.api,
      userPool: identityConstructs.userPool,
      userPoolClient: identityConstructs.userPoolClient,
      webSocketStage: webSocket.WebSocketStage,
      cloudFrontWebDistribution: webAppConstruct.cfWeb,
    });

    NagSuppressions.addStackSuppressions(this, [
      {
        id: 'AwsSolutions-IAM4',
        reason: 'AWSLambdaBasicExecutionRole is added by CDK lambda construct',
        appliesTo: [
          {
            regex: `/^Policy::(.*)service-role/AWSLambdaBasicExecutionRole$/g`,
          },
        ],
      },
    ]);

    NagSuppressions.addStackSuppressions(this, [
      {
        id: 'AwsSolutions-L1',
        reason: 'Latest runtime cannot be configured. CDK will need to upgrade its deployment constructs accordingly.',
      },
    ]);
  }
}
