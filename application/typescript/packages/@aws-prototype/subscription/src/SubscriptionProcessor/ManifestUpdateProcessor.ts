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
import { DynamoDB } from 'aws-sdk';
import { DynamoDBRecord } from 'aws-lambda';
import { SubscriptionProcessor, Message } from './types';

const SUBSCRIPTION_TYPE = 'ManifestUpdate';
const MANIFEST_TABLE_ARN = process.env.MANIFEST_TABLE_ARN;

const getTopicById = (id: string) => {
  return `${id}_${SUBSCRIPTION_TYPE}`;
};

class ManifestUpdateProcessor implements SubscriptionProcessor {
  toSubscribe = (type: string, payload: any) => {
    return type === SUBSCRIPTION_TYPE && payload?.id;
  };

  getTopic = (payload: any) => {
    return getTopicById(payload.id);
  };

  toProcess(event: any): boolean {
    return (
      event.eventSource === 'aws:dynamodb' &&
      event.eventName === 'MODIFY' &&
      event.eventSourceARN.startsWith(MANIFEST_TABLE_ARN)
    );
  }

  process(record: DynamoDBRecord): Message | null {
    if (record.dynamodb?.NewImage) {
      const data = DynamoDB.Converter.unmarshall(record.dynamodb?.NewImage);
      const topic = getTopicById(data.Id);
      return {
        topic,
        type: SUBSCRIPTION_TYPE,
        data: data,
      };
    }
    return null;
  }
}

export default ManifestUpdateProcessor;
