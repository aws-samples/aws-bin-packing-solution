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
import { NagSuppressions } from 'cdk-nag';

export default class StorageConstruct extends Construct {
  public readonly webBucket: s3.Bucket;
  public readonly websiteIndexBucket: s3.Bucket;
  public readonly storageBucket: s3.Bucket;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const accessLogBucket = new s3.Bucket(this, 'access-log-bucket', {
      removalPolicy: core.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      enforceSSL: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    NagSuppressions.addResourceSuppressions(accessLogBucket, [
      {
        id: 'AwsSolutions-S1',
        reason: 'access log bucket',
      },
    ]);

    this.webBucket = new s3.Bucket(this, 'ui-hosting-bucket', {
      removalPolicy: core.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      websiteIndexDocument: 'index.html',
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.POST,
            s3.HttpMethods.PUT,
            s3.HttpMethods.DELETE,
            s3.HttpMethods.HEAD,
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
      enforceSSL: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      serverAccessLogsBucket: accessLogBucket,
      serverAccessLogsPrefix: 'ui-hosting-bucket',
    });

    /** S3 bucket storing the dynamically generated index files. */
    this.websiteIndexBucket = new s3.Bucket(this, 'WebsiteIndexBucket', {
      removalPolicy: core.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      serverAccessLogsBucket: accessLogBucket,
      serverAccessLogsPrefix: 'website-index-bucket',
    });

    new core.CfnOutput(this, 'WebBucket', { value: this.webBucket.bucketName });

    this.storageBucket = new s3.Bucket(this, 'storage-bucket', {
      removalPolicy: core.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      enforceSSL: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      serverAccessLogsBucket: accessLogBucket,
      serverAccessLogsPrefix: 'storage-bucket',
    });

    const stack = core.Stack.of(this);

    NagSuppressions.addResourceSuppressions(this.webBucket, [
      {
        id: 'AwsSolutions-S5',
        reason: 'The permissions are added by CDK grantRead method',
      },
    ]);

    NagSuppressions.addStackSuppressions(stack, [
      {
        id: 'AwsSolutions-IAM5',
        reason:
          'All Policies have been scoped to a Bucket. Given Buckets can contain arbitrary content, wildcard resources with bucket scope are required.',
        appliesTo: [
          {
            regex: '/^Action::s3:.*$/g',
          },
          {
            regex: '/^Resource::.*$/g',
          },
        ],
      },
    ]);

    new core.CfnOutput(this, 'StorageBucket', { value: this.storageBucket.bucketName });
  }
}
