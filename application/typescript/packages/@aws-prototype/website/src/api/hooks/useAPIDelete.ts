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
import { useMutation, useQueryClient } from 'react-query';
import getAPIPath from 'utils/getAPIPath';
import parseAPIError from 'utils/parseAPIError'; 
import { APIRequest } from '../types';

const useAPIDelete = (request: APIRequest, options?: {
  [key: string]: string | boolean | number
}) => {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, unknown>(async (payload) => {
    try {
      const res = await API.del(request.apiName, getAPIPath(request, payload), {
        ...request.apiOptions,
      });
      await queryClient.invalidateQueries(request.queryKey);
      return res;
    } catch (err) {
      throw parseAPIError(err as Error);
    }
  }, {
    ...request.reactQueryOptions,
    ...options
  });
};

export default useAPIDelete;
