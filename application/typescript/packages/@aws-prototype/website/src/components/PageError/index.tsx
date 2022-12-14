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

import { FunctionComponent } from 'react';
import Box from 'aws-northstar/layouts/Box';
import Alert from 'aws-northstar/components/Alert';

export interface PageErrorProps {
    header?: string;
    message?: string;
    retryOnClick?: () => void;
}

const PageError: FunctionComponent<PageErrorProps> = ({
    header = 'Oops! Something went wrong',
    message = 'There was an issue on your request. Please try again later.',
    retryOnClick,
}) => (
    <Box width="100%" display="flex" justifyContent="center" p={10}>
        <Alert
            type="error"
            header={header}
            buttonText={retryOnClick ? 'Retry' : undefined}
            onButtonClick={retryOnClick}
        >
            {message}
        </Alert>
    </Box>
);

export default PageError;
