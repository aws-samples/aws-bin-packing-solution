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

import { Arn, Duration, Stack, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as apigwv2auth from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import * as waf from 'aws-cdk-lib/aws-wafv2';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { ApiConstructProps } from '../../types';
import { HttpApi, HttpMethod, CorsHttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { NagSuppressions } from 'cdk-nag';
export default class ApiConstruct extends Construct {
  readonly execRole: Role;

  readonly api: HttpApi;

  public webAcl: waf.CfnWebACL;

  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);

    const authorizer = new apigwv2auth.HttpUserPoolAuthorizer('user-pool-authorizer', props.CognitoUserPool, {
      userPoolClients: [props.CognitoAppClient],
      identitySource: ['$request.header.Authorization'],
    });

    const stack = Stack.of(this);

    this.api = new HttpApi(this, 'BinPackingSolutionDataApi', {
      corsPreflight: {
        allowHeaders: ['Authorization', 'Content-Type', 'X-Amz-Date', 'X-Api-Key'],
        allowMethods: [
          CorsHttpMethod.GET,
          CorsHttpMethod.HEAD,
          CorsHttpMethod.OPTIONS,
          CorsHttpMethod.POST,
          CorsHttpMethod.PUT,
          CorsHttpMethod.PATCH,
          CorsHttpMethod.DELETE,
        ],
        allowOrigins: ['*'],
        maxAge: Duration.days(1),
      },
    });

    const stage = this.api.defaultStage!.node.defaultChild as apigw.CfnStage;
    const logGroup = new logs.LogGroup(this, 'AccessLogs', {
      retention: 7,
    });

    stage.accessLogSetting = {
      destinationArn: logGroup.logGroupArn,
      format: JSON.stringify(apigw.AccessLogFormat.clf()),
    };

    logGroup.grantWrite(new ServicePrincipal('apigateway.amazonaws.com'));

    this.addRoutes(this.api, props, authorizer);

    new CfnOutput(this, 'API', {
      value: this.api.apiId,
      description: 'API ID',
      exportName: 'ApiId',
    });

    const apiArn = Arn.format(
      {
        resource: 'apis',
        service: 'apigateway',
        resourceName: this.api.apiId,
      },
      stack,
    );

    NagSuppressions.addResourceSuppressions(stage, [
      {
        id: 'AwsSolutions-APIG1',
        reason: 'Logging is enabled on CfnStage',
      },
    ]);

    new CfnOutput(this, 'APIArn', {
      value: apiArn,
      description: 'API ARN',
      exportName: 'APIArn',
    });

    if (this.api.url) {
      new CfnOutput(this, 'APIEndpoint', {
        value: this.api.url,
        description: 'API Endpoint',
        exportName: 'APIEndpoint',
      });
    }
  }

  private addRoutes = (api: HttpApi, props: ApiConstructProps, authorizer: apigwv2auth.HttpUserPoolAuthorizer) => {
    api.addRoutes({
      authorizer: authorizer,
      path: '/container/type',
      methods: [HttpMethod.GET, HttpMethod.POST],
      integration: new HttpLambdaIntegration('container-type-integration', props.APIFunction),
    });

    api.addRoutes({
      authorizer: authorizer,
      path: '/container/type/{id}',
      methods: [HttpMethod.GET, HttpMethod.DELETE, HttpMethod.PUT],
      integration: new HttpLambdaIntegration('container-type-integration', props.APIFunction),
    });

    api.addRoutes({
      authorizer: authorizer,
      path: '/item/type',
      methods: [HttpMethod.GET, HttpMethod.POST],
      integration: new HttpLambdaIntegration('container-type-integration', props.APIFunction),
    });

    api.addRoutes({
      authorizer: authorizer,
      path: '/item/type/{id}',
      methods: [HttpMethod.GET, HttpMethod.DELETE, HttpMethod.PUT],
      integration: new HttpLambdaIntegration('container-type-integration', props.APIFunction),
    });

    api.addRoutes({
      authorizer: authorizer,
      path: '/manifest',
      methods: [HttpMethod.GET, HttpMethod.POST],
      integration: new HttpLambdaIntegration('container-type-integration', props.APIFunction),
    });

    api.addRoutes({
      authorizer: authorizer,
      path: '/manifest/{id}',
      methods: [HttpMethod.GET, HttpMethod.DELETE, HttpMethod.PUT],
      integration: new HttpLambdaIntegration('container-type-integration', props.APIFunction),
    });

    api.addRoutes({
      authorizer: authorizer,
      path: '/manifest/result/{id}',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration('container-type-integration', props.APIFunction),
    });

    api.addRoutes({
      authorizer: authorizer,
      path: '/shipment/{shipmentId}/manifest',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration('container-type-integration', props.APIFunction),
    });

    api.addRoutes({
      authorizer: authorizer,
      path: '/shipment',
      methods: [HttpMethod.GET, HttpMethod.POST],
      integration: new HttpLambdaIntegration('container-type-integration', props.APIFunction),
    });

    api.addRoutes({
      authorizer: authorizer,
      path: '/shipment/{id}',
      methods: [HttpMethod.GET, HttpMethod.DELETE, HttpMethod.PUT],
      integration: new HttpLambdaIntegration('container-type-integration', props.APIFunction),
    });

    api.addRoutes({
      authorizer: authorizer,
      path: '/solver',
      methods: [HttpMethod.GET, HttpMethod.POST],
      integration: new HttpLambdaIntegration('solver-integration', props.APIFunction),
    });
  };
}
