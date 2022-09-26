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
import axios from 'axios';
import jwt from 'jsonwebtoken';
const jwkToPem = require('jwk-to-pem');

const region = process.env.AWS_REGION;
const cognitoUserPoolId = process.env.COGNITO_USER_POOL_ID || '';

const cognitoIssuer = `https://cognito-idp.${region}.amazonaws.com/${cognitoUserPoolId}`;

interface TokenHeader {
  kid: string;
  alg: string;
}

interface PublicKey {
  alg: string;
  e: string;
  kid: string;
  kty: string;
  n: string;
  use: string;
}

interface PublicKeyMeta {
  instance: PublicKey;
  pem: string;
}

interface PublicKeys {
  keys: PublicKey[];
}

interface MapOfKidToPublicKey {
  [key: string]: PublicKeyMeta;
}

interface Claim {
  /* eslint camelcase: "off" */
  token_use: string;
  /* eslint camelcase: "off" */
  auth_time: number;
  iss: string;
  exp: number;
  username: string;
  /* eslint camelcase: "off" */
  client_id: string;
}

let cacheKeys: MapOfKidToPublicKey | undefined;
const getPublicKeys = async (): Promise<MapOfKidToPublicKey> => {
  if (!cacheKeys) {
    const url = `${cognitoIssuer}/.well-known/jwks.json`;
    const publicKeys = await axios.get<PublicKeys>(url);
    cacheKeys = publicKeys.data.keys.reduce((agg, current) => {
      const pem = jwkToPem(current);
      agg[current.kid] = { instance: current, pem };
      return agg;
    }, {} as MapOfKidToPublicKey);
    return cacheKeys;
  } else {
    return cacheKeys;
  }
};

exports.handler = async (event: any, context: any) => {
  const methodArn = event.methodArn;
  const token = event.queryStringParameters.token;

  try {
    if (!token) {
      console.log('Error: Requested token is invalid');
      context.fail('Unauthorized');
      return;
    }

    const sections = token.split('.');

    if (sections.length < 2) {
      console.log('Error: Requested token is invalid');
      context.fail('Unauthorized');
      return;
    }

    const headerJSON = Buffer.from(sections[0], 'base64').toString('utf8');
    const header = JSON.parse(headerJSON) as TokenHeader;
    const keys = await getPublicKeys();
    const key = keys[header.kid];
    if (key === undefined) {
      console.log('Error: Claim made for unknown kid');
      context.fail('Unauthorized');
      return;
    }

    const claim = jwt.verify(token, key.pem) as Claim;

    const currentSeconds = Math.floor(new Date().valueOf() / 1000);

    if (currentSeconds > claim.exp || currentSeconds < claim.auth_time) {
      console.log('Error: Claim is expired or invalid');
      context.fail('Unauthorized');
      return;
    }

    if (claim.iss !== cognitoIssuer) {
      console.log('Error: Claim issuer is invalid');
      context.fail('Unauthorized');
      return;
    }

    if (!(claim.token_use === 'id' || claim.token_use === 'access')) {
      console.log('Error: Claim use is not id or access');
      context.fail('Unauthorized');
      return;
    }

    console.log(`Claim confirmed for ${claim.username}`);
    context.succeed({
      principalId: claim.username,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: [methodArn],
          },
        ],
      },
    });
  } catch (error) {
    console.log('Error: ', error);
    context.fail('Unauthorized');
  }
};
