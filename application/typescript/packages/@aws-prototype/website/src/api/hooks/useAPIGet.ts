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
import { API } from 'aws-amplify';
import { useQuery as useReactQuery } from 'react-query';
import getAPIPath from 'utils/getAPIPath';
import parseAPIError from 'utils/parseAPIError'; 
import { APIRequest } from '../types';

const useAPIGet = <TResponse extends unknown>(request: APIRequest, options?: {
  [key: string]: string | boolean | number
}) => {
  return useReactQuery<TResponse, Error>(request.queryKey, async () => {
    try {
      const res = await API.get(request.apiName, getAPIPath(request), {
        ...request.apiOptions,
      });
      return res;
    } catch (err) {
      throw parseAPIError(err as Error);
    }
  }, {
    ...request.reactQueryOptions,
    ...options
  });
};

export default useAPIGet;
