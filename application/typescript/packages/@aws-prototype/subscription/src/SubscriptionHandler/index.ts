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
import * as AWS from 'aws-sdk';
import MessageHandler from '../MessageHandler';
import { Message } from '../SubscriptionProcessor/types';
import { SubscriptionProcessorFactory } from '../SubscriptionProcessor';

const documentClient = new AWS.DynamoDB.DocumentClient();
const subscriptionTable = process.env.SUBSCRIPTIONS_TABLE_NAME || '';
const subscriptionConnectionIndex = process.env.SUBSCRIPTION_CONNECTION_INDEX_NAME || '';

const region = process.env.AWS_REGION;
AWS.config.update({ region });

interface Subscription {
  topic: string;
  connectionId: string;
}

class SubscriptionHandler {
  subscribe = async (connectionId: string, type: string, payload?: any) => {
    const processor = new SubscriptionProcessorFactory().getProcessor((proc) => proc.toSubscribe(type, payload));
    if (!processor) {
      throw new Error(`Unsupport subscription type: ${type}`);
    }

    const topic = processor.getTopic(payload);

    const record: Subscription = {
      topic,
      connectionId,
    };

    const dynamoDBPutRequest = {
      TableName: subscriptionTable,
      Item: {
        ...record,
      },
    };

    await documentClient.put(dynamoDBPutRequest).promise();
    return {
      message: 'Subscribe succeed',
      topic,
    };
  };

  unsubscribe = async (connectionId: string, type: string, payload?: any) => {
    const processor = new SubscriptionProcessorFactory().getProcessor((proc) => proc.toSubscribe(type, payload));
    if (!processor) {
      throw new Error(`Unsupport subscription type: ${type}`);
    }

    const topic = processor.getTopic(payload);

    const dynamoDBDeleteRequest = {
      TableName: subscriptionTable,
      Key: {
        topic,
        connectionId,
      },
    };

    await documentClient.delete(dynamoDBDeleteRequest).promise();
    return {
      message: 'Unsubscribe succeed',
      topic,
    };
  };

  unsubscribeAll = async (connectionId: string) => {
    const params = {
      TableName: subscriptionTable,
      IndexName: subscriptionConnectionIndex,
      KeyConditionExpression: '#c = :c',
      ExpressionAttributeNames: {
        '#c': 'connectionId',
      },
      ExpressionAttributeValues: {
        ':c': connectionId,
      },
    };
    const response = await documentClient.query(params).promise();
    if (response.Items && response.Items.length > 0) {
      const batchDeleteItems = response.Items.map((x) => ({
        DeleteRequest: {
          Key: {
            topic: x.topic,
            connectionId: x.connectionId,
          },
        },
      }));
      const batchDeleteRequest = {
        RequestItems: {
          [subscriptionTable]: batchDeleteItems,
        },
      };
      await documentClient.batchWrite(batchDeleteRequest).promise();
    }
  };

  sendMessage = async (message: Message) => {
    const subscriptions = await this.getSubscriptionsByTopic(message.topic);
    if (subscriptions && subscriptions.length > 0) {
      const messageHandler = new MessageHandler();
      const messages = subscriptions.map(async ({ connectionId }) => {
        await messageHandler.send(connectionId, {
          type: message.type,
          data: message.data,
        });
      });
      await Promise.all(messages);
    }
  };

  private getSubscriptionsByTopic = async (topic: string) => {
    const params = {
      TableName: subscriptionTable,
      KeyConditionExpression: '#t = :t',
      ExpressionAttributeNames: {
        '#t': 'topic',
      },
      ExpressionAttributeValues: {
        ':t': topic,
      },
    };
    const response = await documentClient.query(params).promise();
    return response.Items as Subscription[];
  };
}

export default SubscriptionHandler;
