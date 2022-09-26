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
const checker = require('license-checker');
const fs = require('fs');

/**
 * List of permitted SPDX identifiers
 */
const PERMITTED_LICENSES = [
  'MIT',
  'Apache-2.0',
  'Unlicense',
  'BSD',
  'BSD*',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'ISC',
  'Zlib',
  'WTFPL',
];

const PACKAGES_PATH = 'packages/@aws-prototype';

/**
 * Checks the given path for dependencies with licenses not in the permitted list above
 * @param path the path to check, containing a node_modules directory
 */
const check = (path: string) =>
  new Promise((resolve, reject) => {
    checker.init(
      {
        start: path,
        onlyAllow: PERMITTED_LICENSES.join(';'),
        production: true,
        excludePrivatePackages: true,
        summary: true,
      },
      (err, packages) => (err ? reject(err) : resolve(packages)),
    );
  });

/**
 * Check the license of all dependencies, and throw an error if any non permitted licenses.
 */
const main = async () => {
  // Check the top level workspace
  await check('.');

  // Check individual packages within our workspace
  const packageDirectories = fs
    .readdirSync(PACKAGES_PATH, { withFileTypes: true })
    .filter((f) => f.isDirectory())
    .map((dir) => dir.name);

  for (const pkg of packageDirectories) {
    await check(`${PACKAGES_PATH}/${pkg}`);
  }
};

(async () => {
  await main();
})();
