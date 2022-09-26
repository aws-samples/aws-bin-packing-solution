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
import { Cache, ComputeType, LinuxBuildImage, LocalCacheMode } from 'aws-cdk-lib/aws-codebuild';
import { IRepository, Repository } from 'aws-cdk-lib/aws-codecommit';
import { Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { PhysicalName, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ManualApprovalStep, CodePipeline, CodePipelineSource, ShellStep, CodeBuildStep } from 'aws-cdk-lib/pipelines';
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { Key } from 'aws-cdk-lib/aws-kms';
import { PipelineStage } from './pipeline-stage';

export class PipelineStack extends Stack {
  readonly pipeline: CodePipeline;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const appName = scope.node.tryGetContext('application');
    const language = scope.node.tryGetContext('language');

    const repo: IRepository = new Repository(this, 'CodeRepo', {
      repositoryName: appName,
    });

    const encryptionKey = new Key(this, 'ArtifactBucketEncryptionKey', {
      // The key remains for a grace period of a few days once removed, which allows for emergency access to the
      // artifact bucket.
      removalPolicy: RemovalPolicy.DESTROY,
      enableKeyRotation: true,
    });

    const artifactBucket = new Bucket(this, 'ArtifactBucket', {
      bucketName: PhysicalName.GENERATE_IF_NEEDED,
      encryptionKey,
      encryption: BucketEncryption.KMS,
      blockPublicAccess: new BlockPublicAccess(BlockPublicAccess.BLOCK_ALL),
      removalPolicy: RemovalPolicy.RETAIN,
    });

    const codePipeline = new Pipeline(this, 'CodePipeline', {
      pipelineName: id,
      artifactBucket,
      restartExecutionOnUpdate: true,
    });

    const synthStep = new ShellStep('Build', {
      input: CodePipelineSource.codeCommit(repo, 'mainline'),
      primaryOutputDirectory: `application/${language}/packages/@aws-prototype/cicd/cdk.out`,
      installCommands: ['gem install cfn-nag'],
      commands: [
        'cd application',
        `cd ${language}`,
        '/bin/bash -c "source hooks && proto_install && proto_build && proto_synth"',
      ],
    });

    this.pipeline = new CodePipeline(this, 'Pipeline', {
      codePipeline,
      selfMutation: true,
      synth: synthStep,
    });
  }

  public addPipelineStage(stage: PipelineStage, requiresManualApproval = false) {
    if (requiresManualApproval) {
      this.pipeline.addStage(stage, {
        pre: [new ManualApprovalStep(`ApprovePromotionTo${stage.stageName}`)],
      });
    } else {
      this.pipeline.addStage(stage);
    }
  }
}
