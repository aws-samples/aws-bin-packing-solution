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
import * as core from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as customResource from 'aws-cdk-lib/custom-resources';
import * as logs from 'aws-cdk-lib/aws-logs';
import { HttpApi, WebSocketStage } from '@aws-cdk/aws-apigatewayv2-alpha';
import { Function } from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { NagSuppressions } from 'cdk-nag';
import * as path from 'path';
import * as fs from 'fs';

interface WebAppDeploymentConstructProps {
  webBucket: s3.Bucket;
  websiteIndexBucket: s3.Bucket;
  websiteIndexBuilderFunction: Function;
  cloudFrontWebDistribution: cloudfront.CloudFrontWebDistribution;
  api: HttpApi;
  userPool: cognito.UserPool;
  userPoolClient: cognito.UserPoolClient;
  webSocketStage: WebSocketStage;
}

const WEBSITE_ASSETS_PATH = '../../../website/build';

export default class WebAppDeploymentConstruct extends Construct {
  constructor(scope: Construct, id: string, props: WebAppDeploymentConstructProps) {
    super(scope, id);

    const stack = core.Stack.of(this);

    const buildWebsiteIndexCustomResourceProvider = new customResource.Provider(
      this,
      'BuildWebsiteIndexCustomResourceProvider',
      {
        onEventHandler: props.websiteIndexBuilderFunction,
        logRetention: logs.RetentionDays.ONE_DAY,
      },
    );

    const indexFile = fs.readFileSync(path.join(__dirname, WEBSITE_ASSETS_PATH, 'index.html'), 'utf8');

    const buildWebsiteIndexCustomResource = new core.CustomResource(this, 'BuildWebsiteIndexCustomResource', {
      serviceToken: buildWebsiteIndexCustomResourceProvider.serviceToken,
      properties: {
        s3BucketName: props.websiteIndexBucket.bucketName,
        template: indexFile,
        apiUrl: props.api.url,
        region: core.Stack.of(this).region,
        cognitoUserPoolId: props.userPool.userPoolId,
        cognitoAppClientId: props.userPoolClient.userPoolClientId,
        webSocketUrl: props.webSocketStage.url,
      },
    });

    props.websiteIndexBucket.grantReadWrite(props.websiteIndexBuilderFunction);

    new s3Deployment.BucketDeployment(this, 'cachedDeployWebsite', {
      sources: [
        s3Deployment.Source.asset(path.join(__dirname, WEBSITE_ASSETS_PATH), {
          exclude: ['index.html', 'config.js', 'config.*.js'],
        }),
      ],
      destinationBucket: props.webBucket,
      distribution: props.cloudFrontWebDistribution,
      destinationKeyPrefix: 'webui',
      prune: false,
    });

    new s3Deployment.BucketDeployment(this, 'UncachedDeployWebsite', {
      sources: [s3Deployment.Source.bucket(props.websiteIndexBucket, buildWebsiteIndexCustomResource.ref)],
      destinationBucket: props.webBucket,
      distribution: props.cloudFrontWebDistribution,
      destinationKeyPrefix: 'webui',
      cacheControl: [s3Deployment.CacheControl.noCache()],
      prune: false,
    });
  }
}
