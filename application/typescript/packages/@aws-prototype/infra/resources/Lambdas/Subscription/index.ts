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
import { CfnOutput, Duration, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as path from 'path';
import * as permissionUtils from '../../../utils/Permissions';

export interface SubscriptionLambdaConstructPropsBase {
  Mode: 'DYNAMODB_STREAM_HANDLER' | 'WEB_SOCKET_CONNECTION_HANDLER';
  SubscriptionsTable: dynamodb.Table;
  SubscriptionsConnectionIdIndex: string;
}

export interface DynamoDBStreamHandlerProp extends SubscriptionLambdaConstructPropsBase {
  Mode: 'DYNAMODB_STREAM_HANDLER';
  WebSocketURL: string;
  WebSocketAPIId: string;
  ManifestTable: dynamodb.Table;
}

export interface WebSocketConnectionHandlerProp extends SubscriptionLambdaConstructPropsBase {
  Mode: 'WEB_SOCKET_CONNECTION_HANDLER';
}

export type SubscriptionLambdaConstructProps = WebSocketConnectionHandlerProp | DynamoDBStreamHandlerProp;

export default class SubscriptionLambdaConstruct extends Construct {
  readonly SubscriptionFunction: lambda.Function;

  constructor(scope: Construct, id: string, props: SubscriptionLambdaConstructProps) {
    super(scope, id);

    const extraEnvs: { [key: string]: string } =
      props.Mode === 'DYNAMODB_STREAM_HANDLER'
        ? {
            WEBSOCKET_URL: props.WebSocketURL,
            MANIFEST_TABLE_ARN: props.ManifestTable.tableArn,
          }
        : {};

    this.SubscriptionFunction = new NodejsFunction(this, 'subscriptionHandlerFn', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'handler',
      entry: path.join(__dirname, '../../../../subscription/src/index.ts'),
      timeout: Duration.seconds(10),
      memorySize: 256,
      environment: {
        SUBSCRIPTIONS_TABLE_NAME: props.SubscriptionsTable.tableName,
        SUBSCRIPTION_CONNECTION_INDEX_NAME: props.SubscriptionsConnectionIdIndex,
        ...extraEnvs,
      },
      tracing: lambda.Tracing.ACTIVE,
    });

    if (this.SubscriptionFunction.role) {
      permissionUtils.default.addDynamoDbPermissions(props.SubscriptionsTable, this.SubscriptionFunction.role);
    }

    if (props.Mode === 'DYNAMODB_STREAM_HANDLER') {
      this.SubscriptionFunction.addEventSource(
        new lambdaEventSources.DynamoEventSource(props.ManifestTable, {
          startingPosition: lambda.StartingPosition.TRIM_HORIZON,
          retryAttempts: 5,
        }),
      );

      this.SubscriptionFunction.role?.addToPrincipalPolicy(
        iam.PolicyStatement.fromJson({
          Effect: 'Allow',
          Action: ['execute-api:ManageConnections'],
          Resource: [
            `arn:aws:execute-api:${Stack.of(this).region}:${Stack.of(this).account}:${
              props.WebSocketAPIId
            }/*/POST/@connections/*`,
          ],
        }),
      );
    }

    new CfnOutput(this, 'Subscription Lambda ARN', {
      value: this.SubscriptionFunction.functionArn,
      description: `${props.Mode} Lambda ARN`,
    });
  }
}
