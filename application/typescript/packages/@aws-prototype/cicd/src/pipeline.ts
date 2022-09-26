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
import { App } from 'aws-cdk-lib';
import { PipelineStack } from './pipeline-stack';
import { PipelineStage } from './pipeline-stage';
import { PIPELINE_ENV, PIPELINE_STAGES, SANDBOX_STAGE } from './accounts';

const app = new App();
const appName = app.node.tryGetContext('application');

const pipeline = new PipelineStack(app, `${appName}Pipeline`, { env: PIPELINE_ENV });

new PipelineStage(app, SANDBOX_STAGE.stageName, SANDBOX_STAGE);

PIPELINE_STAGES.forEach((stage) => {
  pipeline.addPipelineStage(new PipelineStage(app, stage.stageName, stage), stage.requiresManualApproval);
});

app.synth();
