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
import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { ContainerType } from '@aws-prototype/shared-types';
import { useAPIPut, useAPIGet, getContainerTypeRequest, updateContainerTypeRequest } from 'api';
import ContainerTypeEdit from '../Edit';

const ContainerTypeUpdate: FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useAPIGet<ContainerType>(getContainerTypeRequest(id));

  const { mutate } = useAPIPut<ContainerType, ContainerType>(updateContainerTypeRequest(id));

  return <ContainerTypeEdit data={data} isLoading={isLoading} error={error} mutate={mutate} />;
};

export default ContainerTypeUpdate;
