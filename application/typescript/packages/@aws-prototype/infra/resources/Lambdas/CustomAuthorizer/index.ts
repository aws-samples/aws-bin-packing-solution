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
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import { UserPool } from 'aws-cdk-lib/aws-cognito';

export interface CustomAuthorizerLambdaConstructProps {
  CognitoUserPool: UserPool;
}

export default class CustomAuthorizerLambdaConstruct extends Construct {
  readonly CustomAuthorizerFunction: lambda.Function;

  constructor(scope: Construct, id: string, props: CustomAuthorizerLambdaConstructProps) {
    super(scope, id);

    this.CustomAuthorizerFunction = new NodejsFunction(this, 'customAuthorizerHandlerFn', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'handler',
      entry: path.join(__dirname, '../../../../custom-authorizer/src/index.ts'),
      timeout: Duration.seconds(10),
      memorySize: 256,
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        COGNITO_USER_POOL_ID: props.CognitoUserPool.userPoolId,
      },
    });
  }
}
