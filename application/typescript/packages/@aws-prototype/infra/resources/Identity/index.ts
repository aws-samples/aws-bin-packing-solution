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
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { OAuthScope, UserPoolClientIdentityProvider } from 'aws-cdk-lib/aws-cognito';
import { StackProps, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';

interface IdentityConstructProps extends StackProps {
  uiWebDistribution: cloudfront.CloudFrontWebDistribution;
}

export default class IdentityConstructs extends Construct {
  public readonly userPool: cognito.UserPool;

  public readonly userPoolClient: cognito.UserPoolClient;

  public readonly userPoolDomain: cognito.UserPoolDomain;

  public readonly identityPool: cognito.CfnIdentityPool;

  constructor(scope: Construct, id: string, props: IdentityConstructProps) {
    super(scope, id);

    // User Pool
    this.userPool = new cognito.UserPool(this, 'userpool', {
      userPoolName: 'binpacking-solution-user-pool',
      selfSignUpEnabled: false,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        givenName: {
          required: true,
          mutable: true,
        },
        familyName: {
          required: true,
          mutable: true,
        },
      },
      customAttributes: {
        country: new cognito.StringAttribute({ mutable: true }),
        city: new cognito.StringAttribute({ mutable: true }),
        isAdmin: new cognito.StringAttribute({ mutable: true }),
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireDigits: true,
        requireUppercase: true,
        requireSymbols: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    (this.userPool.node.defaultChild as cognito.CfnUserPool).userPoolAddOns = {
      advancedSecurityMode: 'ENFORCED',
    };

    const standardCognitoAttributes = {
      givenName: true,
      familyName: true,
      email: true,
      emailVerified: true,
      address: true,
      birthdate: true,
      gender: true,
      locale: true,
      middleName: true,
      fullname: true,
      nickname: true,
      phoneNumber: true,
      phoneNumberVerified: true,
      profilePicture: true,
      preferredUsername: true,
      profilePage: true,
      timezone: true,
      lastUpdateTime: true,
      website: true,
    };

    const clientReadAttributes = new cognito.ClientAttributes()
      .withStandardAttributes(standardCognitoAttributes)
      .withCustomAttributes(...['country', 'city', 'isAdmin']);

    const clientWriteAttributes = new cognito.ClientAttributes()
      .withStandardAttributes({
        ...standardCognitoAttributes,
        emailVerified: false,
        phoneNumberVerified: false,
      })
      .withCustomAttributes(...['country', 'city']);

    //  User Pool Client
    this.userPoolClient = this.userPool.addClient('userpool-client', {
      authFlows: {
        adminUserPassword: true,
        custom: true,
        userSrp: true,
        userPassword: true,
      },
      disableOAuth: false,
      readAttributes: clientReadAttributes,
      writeAttributes: clientWriteAttributes,
      generateSecret: false,
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: true,
          clientCredentials: false,
        },
        scopes: [OAuthScope.OPENID, OAuthScope.EMAIL, OAuthScope.COGNITO_ADMIN],
        callbackUrls: [`https://${props.uiWebDistribution.distributionDomainName}`],
      },
      supportedIdentityProviders: [UserPoolClientIdentityProvider.COGNITO],
    });

    // Output

    new CfnOutput(this, 'UserPool', {
      value: this.userPool.userPoolId,
      description: 'User pool Id',
      exportName: 'userPoolId',
    });

    new CfnOutput(this, 'UserPoolClient', {
      value: this.userPoolClient.userPoolClientId,
      description: 'User pool client Id',
      exportName: 'userPoolClientId',
    });
  }
}
