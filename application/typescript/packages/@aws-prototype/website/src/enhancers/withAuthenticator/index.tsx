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
import { Amplify, Auth } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import getConfig from 'utils/getConfig';

import '@aws-amplify/ui-react/styles.css';
import './styles.css';
import { API_SOLUTION } from 'config/api';

const { region, cognitoUserPoolId, cognitoAppClientId, apiUrl } = getConfig();

Amplify.configure({
    Auth: {
        region,
        userPoolId: cognitoUserPoolId,
        userPoolWebClientId: cognitoAppClientId,
        mandatorySignIn: true,
    },
    API: {
        endpoints: [
            {
                name: API_SOLUTION,
                endpoint: apiUrl,
                custom_header: async () => {
                    return { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` };
                },
            },
        ],
    },
});

export default withAuthenticator;