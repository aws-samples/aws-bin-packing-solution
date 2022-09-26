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
import { Stack, Stage, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as logs from 'aws-cdk-lib/aws-logs';
import { WebSocketApi, WebSocketStage } from '@aws-cdk/aws-apigatewayv2-alpha';
import * as apiGatewayIntegrations from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NagSuppressions } from 'cdk-nag';
export interface WebSocketConstructProps {
  WebSocketConnectionHandler: lambda.Function;
  CustomAuthorizerHandler: lambda.Function;
}

export default class WebSocketConstruct extends Construct {
  readonly WebSocketApi: WebSocketApi;
  readonly WebSocketStage: WebSocketStage;

  constructor(scope: Construct, id: string, props: WebSocketConstructProps) {
    super(scope, id);

    const stageName = Stage.of(this)?.stageName.toLowerCase() || 'prod';

    this.WebSocketApi = new WebSocketApi(this, 'websocketApi', {
      apiName: 'BinPacking Solution Web Socket API',
    });

    props.WebSocketConnectionHandler.role?.addToPrincipalPolicy(
      iam.PolicyStatement.fromJson({
        Effect: 'Allow',
        Action: ['execute-api:ManageConnections'],
        Resource: [
          `arn:aws:execute-api:${Stack.of(this).region}:${Stack.of(this).account}:${
            this.WebSocketApi.apiId
          }/*/POST/@connections/*`,
        ],
      }),
    );

    this.WebSocketStage = new WebSocketStage(this, 'WebsocketStage', {
      webSocketApi: this.WebSocketApi,
      stageName,
      autoDeploy: true,
    });

    const stage = this.WebSocketStage!.node.defaultChild as apigw.CfnStage;
    const logGroup = new logs.LogGroup(this, 'AccessLogs', {
      retention: 7,
    });

    stage.accessLogSetting = {
      destinationArn: logGroup.logGroupArn,
      format: JSON.stringify(apigw.AccessLogFormat.clf()),
    };

    logGroup.grantWrite(new iam.ServicePrincipal('apigateway.amazonaws.com'));

    const apigatewayCustomAuthorizerRole = new iam.Role(this, 'APIGatewayCustomAuthorizerRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonAPIGatewayPushToCloudWatchLogs'),
      ],
    });

    apigatewayCustomAuthorizerRole.addToPolicy(
      iam.PolicyStatement.fromJson({
        Effect: 'Allow',
        Action: ['lambda:InvokeFunction'],
        Resource: [props.CustomAuthorizerHandler.functionArn],
      }),
    );

    const authorizer = new apigwv2.CfnAuthorizer(this, 'customAuthorizer', {
      apiId: this.WebSocketApi.apiId,
      authorizerType: 'REQUEST',
      authorizerUri: `arn:aws:apigateway:${Stack.of(this).region}:lambda:path/2015-03-31/functions/${
        props.CustomAuthorizerHandler.functionArn
      }/invocations`,
      authorizerCredentialsArn: apigatewayCustomAuthorizerRole.roleArn,
      identitySource: ['route.request.querystring.token'],
      name: 'customAuthorizer',
    });

    new lambda.CfnPermission(this, 'AuthorizerPermission', {
      action: 'lambda:InvokeFunction',
      functionName: props.CustomAuthorizerHandler.functionName,
      principal: 'apigateway.amazonaws.com',
      sourceArn: `arn:aws:execute-api:${Stack.of(this).region}:${Stack.of(this).account}:${
        this.WebSocketApi.apiId
      }/*/$connect`,
    });

    const integration = new apigwv2.CfnIntegration(this, 'WebSocketApiConnectIntegration', {
      apiId: this.WebSocketApi.apiId,
      integrationType: 'AWS_PROXY',
      integrationUri: `arn:aws:apigateway:${Stack.of(this).region}:lambda:path/2015-03-31/functions/${
        props.WebSocketConnectionHandler.functionArn
      }/invocations`,
      integrationMethod: 'POST',
    });

    new lambda.CfnPermission(this, 'ConnectRoutePermission', {
      action: 'lambda:InvokeFunction',
      functionName: props.WebSocketConnectionHandler.functionName,
      principal: 'apigateway.amazonaws.com',
      sourceArn: `arn:aws:execute-api:${Stack.of(this).region}:${Stack.of(this).account}:${
        this.WebSocketApi.apiId
      }/*/$connect`,
    });

    new lambda.CfnPermission(this, 'DisconnectRoutePermission', {
      action: 'lambda:InvokeFunction',
      functionName: props.WebSocketConnectionHandler.functionName,
      principal: 'apigateway.amazonaws.com',
      sourceArn: `arn:aws:execute-api:${Stack.of(this).region}:${Stack.of(this).account}:${
        this.WebSocketApi.apiId
      }/*/$disconnect`,
    });

    new lambda.CfnPermission(this, 'DefaultRoutePermission', {
      action: 'lambda:InvokeFunction',
      functionName: props.WebSocketConnectionHandler.functionName,
      principal: 'apigateway.amazonaws.com',
      sourceArn: `arn:aws:execute-api:${Stack.of(this).region}:${Stack.of(this).account}:${
        this.WebSocketApi.apiId
      }/*/$default`,
    });

    const connectRoute = new apigwv2.CfnRoute(this, 'WebSocketApiConnectRoute', {
      apiId: this.WebSocketApi.apiId,
      routeKey: '$connect',
      operationName: 'connectRoute',
      authorizationType: 'CUSTOM',
      authorizerId: authorizer.ref,
      target: `integrations/${integration.ref}`,
    });

    const disconnectRoute = new apigwv2.CfnRoute(this, 'WebSocketApiDisconnectRoute', {
      apiId: this.WebSocketApi.apiId,
      routeKey: '$disconnect',
      operationName: 'disconnectRoute',
      target: `integrations/${integration.ref}`,
    });

    const defaultRoute = new apigwv2.CfnRoute(this, 'WebSocketApiDefaultRoute', {
      apiId: this.WebSocketApi.apiId,
      routeKey: '$default',
      operationName: 'defaultRoute',
      target: `integrations/${integration.ref}`,
    });

    this.WebSocketStage.node.addDependency(connectRoute);
    this.WebSocketStage.node.addDependency(disconnectRoute);
    this.WebSocketStage.node.addDependency(defaultRoute);

    NagSuppressions.addResourceSuppressions(apigatewayCustomAuthorizerRole, [
      {
        id: 'AwsSolutions-IAM4',
        reason: 'AmazonAPIGatewayPushToCloudWatchLogs permission is required',
      },
    ]);

    const stack = Stack.of(this);

    NagSuppressions.addResourceSuppressions(stage, [
      {
        id: 'AwsSolutions-APIG1',
        reason: 'Logging is enabled on CfnStage',
      },
    ]);

    NagSuppressions.addResourceSuppressions(disconnectRoute, [
      {
        id: 'AwsSolutions-APIG4',
        reason: 'The authorization is only required in the $connect',
      },
    ]);

    NagSuppressions.addResourceSuppressions(defaultRoute, [
      {
        id: 'AwsSolutions-APIG4',
        reason: 'The authorization is only required in the $connect',
      },
    ]);

    new CfnOutput(this, 'APIEndpoint', {
      value: this.WebSocketStage.url,
      description: 'WebSocket API Endpoint',
      exportName: 'BinPackingSolutionWebSocketAPIEndpoint',
    });
  }
}
