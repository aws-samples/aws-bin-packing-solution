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
import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export default class DatabaseConstructs extends Construct {
  readonly ContainerTypeTable: dynamodb.Table;
  readonly ItemTypeTable: dynamodb.Table;
  readonly ShipmentsTable: dynamodb.Table;
  readonly TagsTable: dynamodb.Table;
  readonly ManifestTable: dynamodb.Table;
  readonly SubscriptionTable: dynamodb.Table;
  readonly SubscriptionsConnectionIdIndex: string;
  readonly ManifestsShipmentIdIndex: string;
  readonly PackingItemsTable: dynamodb.Table;
  readonly PackingItemsManifestIdIndex: string;
  readonly PackingContainersTable: dynamodb.Table;
  readonly PackingContainersManifestIdIndex: string;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.ContainerTypeTable = new dynamodb.Table(this, 'ContainerTypes', {
      partitionKey: { name: 'Id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'expiry',
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
    });

    this.ItemTypeTable = new dynamodb.Table(this, 'ItemTypes', {
      partitionKey: { name: 'Id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'expiry',
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
    });

    this.TagsTable = new dynamodb.Table(this, 'Tags', {
      partitionKey: { name: 'Id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'expiry',
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
    });

    this.ShipmentsTable = new dynamodb.Table(this, 'Shipments', {
      partitionKey: { name: 'Id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'expiry',
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
    });

    this.ManifestTable = new dynamodb.Table(this, 'Manifests', {
      partitionKey: { name: 'Id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'expiry',
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      pointInTimeRecovery: true,
    });

    this.ManifestsShipmentIdIndex = 'MANIFEST_SHIPMENT_INDEX';

    this.ManifestTable.addGlobalSecondaryIndex({
      indexName: this.ManifestsShipmentIdIndex,
      partitionKey: { name: 'shipmentId', type: dynamodb.AttributeType.STRING },
    });

    this.PackingContainersTable = new dynamodb.Table(this, 'PackingContainers', {
      partitionKey: { name: 'Id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'expiry',
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      pointInTimeRecovery: true,
    });

    this.PackingContainersManifestIdIndex = 'PACKING_CONTAINERS_MANIFEST_INDEX';

    this.PackingContainersTable.addGlobalSecondaryIndex({
      indexName: this.PackingContainersManifestIdIndex,
      partitionKey: { name: 'manifestId', type: dynamodb.AttributeType.STRING },
    });

    this.PackingItemsTable = new dynamodb.Table(this, 'PackingItems', {
      partitionKey: { name: 'Id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'expiry',
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      pointInTimeRecovery: true,
    });

    this.PackingItemsManifestIdIndex = 'PACKING_ITEMS_MANIFEST_INDEX';

    this.PackingItemsTable.addGlobalSecondaryIndex({
      indexName: this.PackingItemsManifestIdIndex,
      partitionKey: { name: 'manifestId', type: dynamodb.AttributeType.STRING },
    });

    this.SubscriptionTable = new dynamodb.Table(this, 'Subscriptions', {
      partitionKey: {
        name: 'topic',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'connectionId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'expiry',
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
    });

    this.SubscriptionsConnectionIdIndex = 'SUBSCRIPTION_CONNECTION_INDEX';

    const subscriptionsConnectionIdIndex: dynamodb.GlobalSecondaryIndexProps = {
      indexName: this.SubscriptionsConnectionIdIndex,
      partitionKey: { name: 'connectionId', type: dynamodb.AttributeType.STRING },
    };

    this.SubscriptionTable.addGlobalSecondaryIndex(subscriptionsConnectionIdIndex);
  }
}
