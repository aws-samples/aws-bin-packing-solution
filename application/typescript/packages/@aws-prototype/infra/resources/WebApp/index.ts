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
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import CloudfrontWebAcl from '../CloudfrontWebAcl';
import { NagSuppressions } from 'cdk-nag';

interface WebAppConstructProps {
  webBucket: s3.Bucket;
}

export default class WebAppConstruct extends Construct {
  readonly cfWeb: cloudfront.CloudFrontWebDistribution;

  constructor(scope: Construct, id: string, props: WebAppConstructProps) {
    super(scope, id);

    //   this.createWAF(this.node.addr)

    const oai = new cloudfront.OriginAccessIdentity(this, 'OAI', {
      comment: 'OAI for Web Interface',
    });

    props.webBucket.grantRead(oai);

    const webAcl = new CloudfrontWebAcl(this, 'WebACL', {
      name: `${this.node.addr}-WebAcl`,
      managedRules: [{ VendorName: 'AWS', Name: 'AWSManagedRulesCommonRuleSet' }],
    });

    const logBucket = new s3.Bucket(this, 'DistributionLogBucket', {
      enforceSSL: true,
      autoDeleteObjects: true,
      removalPolicy: core.RemovalPolicy.DESTROY,
      encryption: s3.BucketEncryption.S3_MANAGED,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      serverAccessLogsPrefix: 'access-logs',
    });

    this.cfWeb = new cloudfront.CloudFrontWebDistribution(this, 'web-distribution', {
      errorConfigurations: [
        {
          errorCode: 404,
          responseCode: 200,
          responsePagePath: '/index.html',
        },
      ],
      loggingConfig: {
        bucket: logBucket,
      },
      originConfigs: [
        {
          s3OriginSource: {
            originPath: '/webui',
            s3BucketSource: props.webBucket,
            originAccessIdentity: oai,
          },
          behaviors: [{ isDefaultBehavior: true }],
        },
      ],
      webACLId: webAcl.getArn(core.Stack.of(this).account),
    });

    NagSuppressions.addResourceSuppressions(this.cfWeb, [
      {
        id: 'AwsSolutions-CFR4',
        reason: 'Certificate is not mandatory therefore the Cloudfront certificate will be used.',
      },
    ]);

    new core.CfnOutput(this, 'WebApp-CloudFrontUrl', {
      value: this.cfWeb.distributionDomainName,
    });

    new core.CfnOutput(this, 'WebApp-CloudFrontDistributionId', {
      value: this.cfWeb.distributionId,
    });
  }
}
