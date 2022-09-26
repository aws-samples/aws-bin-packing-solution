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
import { Environment } from 'aws-cdk-lib';
import { PipelineStageProps } from './pipeline-stage';

/**
 * This defines the account/region in which the pipeline will reside. We recommend a dedicated pipeline account, and to
 * explicitly specify the account id and region below.
 */
export const PIPELINE_ENV: Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT!,
  // TODO: Replace with your preferred region!
  // us-west-2 is used for pipelines during development by AWS prototyping team, but once the prototype has been
  // delivered any region may be used.
  region: 'us-west-2',
};

/**
 * The sandbox stage is useful for testing changes in a developer account prior to committing them. It can be deployed
 * using `yarn run deploy-sandbox`.
 */
export const SANDBOX_STAGE: PipelineStageProps = {
  stageName: 'Sandbox',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT!,
    region: process.env.CDK_DEFAULT_REGION!,
  },
};

/**
 * Stages are deployed by the pipeline in the order specified here. We recommend a dedicated account for each stage,
 * replacing the CDK_DEFAULT_ACCOUNT references with explicit account ids.
 */
export const PIPELINE_STAGES: PipelineStageProps[] = [
  {
    stageName: 'Dev',
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT!,
      region: process.env.CDK_DEFAULT_REGION!,
    },
  },
];
