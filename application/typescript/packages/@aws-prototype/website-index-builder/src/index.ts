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
import * as fs from 'fs';
import archiver = require('archiver');

AWS.config.update({ region: process.env.AWS_REGION });

const s3 = new AWS.S3();

interface EventType {
  RequestType: string;
  ResourceProperties: Record<string, string>;
  PhysicalResourceId: string;
}

const buildIndexFile = (configContent: string, template: string) => {
  const indexFileContent = template.replace(/<script src="\/config.js"><\/script>/g, configContent);
  return indexFileContent;
};

const createZipFileContent = async (objectKey: string, indexFileContent: string) => {
  const filePath = `/tmp/${objectKey}`;
  const output = fs.createWriteStream(filePath);

  const closed = new Promise((resolve, reject) => {
    output.on('close', resolve);
    output.on('error', reject);
  });

  const archiveHandler = archiver('zip');

  archiveHandler.pipe(output);

  archiveHandler.append(indexFileContent, { name: 'index.html' });

  archiveHandler.finalize();
  await closed;

  return fs.readFileSync(filePath);
};

const createOrUpdateConfig = async (config: Record<string, string>, template: string, s3BucketName: string) => {
  const objectKey = `${Date.now()}.zip`;
  const configContent = `<script>window.__config=${JSON.stringify(config, null, 0)}</script>`;
  const indexFileContent = buildIndexFile(configContent, template);

  if (indexFileContent.search(configContent) < 0) {
    console.log('Index file content:', indexFileContent);
    throw new Error('Failed in generating Index file');
  }

  const zipFileContent = await createZipFileContent(objectKey, indexFileContent);

  await s3
    .putObject({
      Bucket: s3BucketName,
      Key: objectKey,
      Body: zipFileContent,
    })
    .promise();

  return {
    PhysicalResourceId: objectKey,
  };
};

const deleteConfig = async (configKeyToDelete: string, s3BucketName: string) => {
  try {
    await s3
      .deleteObject({
        Bucket: s3BucketName,
        Key: configKeyToDelete,
      })
      .promise();
  } catch (e) {
    console.log('Error in deleting the old config object', e);
  }

  return {};
};

const dispatch = async (event: EventType, requestType: string) => {
  const props = event.ResourceProperties;
  const resourceId = event.PhysicalResourceId;
  switch (requestType) {
    case 'Create':
    case 'Update': {
      const { s3BucketName, template, ...data } = props;
      return createOrUpdateConfig(data, template, s3BucketName);
    }
    case 'Delete': {
      const { s3BucketName } = props;
      return deleteConfig(resourceId, s3BucketName);
    }
    default:
      throw new Error('Unsupported RequestType');
  }
};

exports.handler = async (event: EventType) => {
  console.log('Event: \n' + JSON.stringify(event, null, 2));
  try {
    const requestType = event.RequestType;
    const data = await dispatch(event, requestType);
    console.log('Response', data);
    return data;
  } catch (e) {
    console.log('Error', e);
    throw e;
  }
};
