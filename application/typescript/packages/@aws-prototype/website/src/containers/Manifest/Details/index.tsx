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
import {FC} from 'react';
import {useParams} from 'react-router-dom';
import {Manifest} from '@aws-samples/bin-packing-shared-types';
import {getManifestRequest, useAPIGet,} from 'api';
import QueryContainerTemplate from 'components/QueryContainerTemplate';
import ManifestDetailInner from './components/ManifestDetailsInner';

const ManifestDetails: FC = () => {
  const { id, shipmentId } = useParams<{ id: string; shipmentId: string }>();
  const { data, isLoading, error } = useAPIGet<Manifest>(getManifestRequest(id ?? ''));

  return (
    <QueryContainerTemplate loading={isLoading} error={error} data={data}>
      {(data) => (
        <ManifestDetailInner data={data} shipmentId={shipmentId ?? ''}/>
      )}
    </QueryContainerTemplate>
  );
};

export default ManifestDetails;
