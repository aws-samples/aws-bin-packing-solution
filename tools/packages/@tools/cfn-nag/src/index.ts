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
import { $, fs } from 'zx';
import yaml from 'yaml';
import * as path from 'path';
import minimist from 'minimist';

const IGNORE_FILE_NAME = 'cfn-nag-ignore.yaml';

const getFiles = async (dir: string): Promise<string[]> => {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      dirents.map(async (dirent) => {
        const res: string = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? await getFiles(res) : [res];
      }),
    )
  ).flat();
};

/**
 * Wraps CFN Nag, passing the ignore file if there are any rules to suppress
 */
const nag = async (projectDir: string) => {
  const { out, target } = minimist(process.argv.slice(2), { string: ['out', 'target'] });

  if (!target) {
    console.error('--target <directory containing cdk.out and cfn-nag-ignore.yaml> must be specified');
    process.exit(1);
  }

  // Output dir is relative to prototyping tools directory, which is the most likely place to be running this script from
  const targetCdkOutDir = path.resolve(projectDir, 'tools', target, 'cdk.out');
  const files = await getFiles(targetCdkOutDir);
  const filesToCheck = files.filter((file) => file.endsWith('.template.json') && !file.includes('/cross-region-stack'));

  const ignoreFilePath = path.resolve(projectDir, 'tools', target, IGNORE_FILE_NAME);
  const ignoreFile = await fs.readFile(ignoreFilePath, 'utf-8');
  const ignoreFileParsed = yaml.parse(ignoreFile);

  const hasRules = (ignoreFileParsed?.RulesToSuppress || []).length > 0;

  if (hasRules) {
    if (out) {
      await $`cfn_nag --blacklist-path  ${ignoreFilePath} ${filesToCheck} --output-format=json > ${path.resolve(
        projectDir, 'tools', out
      )}`;
    } else {
      await $`cfn_nag --blacklist-path ${ignoreFilePath} ${filesToCheck}`;
    }
  } else {
    if (out) {
      await $`cfn_nag ${filesToCheck} --output-format=json > ${path.resolve(projectDir, 'tools', out)}`;
    } else {
      await $`cfn_nag ${filesToCheck}`;
    }
  }
};

export interface MainOptions {
  pathToProjectRootDirectory: string;
}

export const main = async (options: MainOptions) => {
  try {
    await nag(options.pathToProjectRootDirectory);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
