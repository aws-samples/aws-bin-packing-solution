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
import { DynamoDBStreamEvent, DynamoDBRecord } from 'aws-lambda';
import { SubscriptionProcessorFactory } from '../SubscriptionProcessor';
import SubscriptionHandler from '../SubscriptionHandler';

class DynamoDBStreamEventHandler {
  handle = async (event: DynamoDBStreamEvent) => {
    const processorFactory = new SubscriptionProcessorFactory();
    const handler = new SubscriptionHandler();
    const processes = event.Records.map((record) => this.handleRecord(processorFactory, handler, record));
    await Promise.all(processes);
  };

  private handleRecord = async (
    processorFactory: SubscriptionProcessorFactory,
    subscriptionHandler: SubscriptionHandler,
    record: DynamoDBRecord,
  ) => {
    const processor = processorFactory.getProcessor((proc) => proc.toProcess(record));
    if (processor) {
      const message = processor.process(record);
      if (message) {
        await subscriptionHandler.sendMessage(message);
      }
    }
  };
}

export default DynamoDBStreamEventHandler;
