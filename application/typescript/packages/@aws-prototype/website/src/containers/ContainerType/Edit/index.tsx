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
import { FC, useCallback, useMemo } from 'react';
import { ContainerType } from '@aws-samples/bin-packing-shared-types';
import { useAPIGet, listContainerTypesRequest } from 'api';
import QueryContainerTemplate from 'components/QueryContainerTemplate';
import GenericEdit, { GenericEditProps } from 'components/GenericEdit';
import ContainerTypeForm, { ContainerTypeFormType } from 'components/ContainerType/Form';
import reduceFeatures from 'utils/reduceFeatures';

export interface ContainerTypeEditProps {
  data?: ContainerType;
  isLoading: boolean;
  error?: Error | null;
  mutate: GenericEditProps<ContainerType>['mutate'];
}

const ContainerTypeEdit: FC<ContainerTypeEditProps> = ({ data, isLoading, error, mutate }) => {
  const {
    data: containerTypes,
    isLoading: isListContainerTypesLoading,
    error: listContainerTypeError,
  } = useAPIGet<ContainerType[]>(listContainerTypesRequest());

  const features = useMemo(() => {
    return reduceFeatures(containerTypes);
  }, [containerTypes]);

  const postProcess = useCallback((data: ContainerTypeFormType) => {
      const { featureOptions, ...rest} = data;
      return {
        ...rest,
        features: featureOptions?.map(fo => fo.value)
      }
  }, []);

  return (
    <QueryContainerTemplate
      loading={isLoading && isListContainerTypesLoading}
      error={error || listContainerTypeError}
      data={{}}
    >
      {() => (
        <GenericEdit
          initialValues={data}
          mutate={mutate}
          FormComponent={ContainerTypeForm}
          additionalProps={{ features }}
          postProcess={postProcess}
        />
      )}
    </QueryContainerTemplate>
  );
};

export default ContainerTypeEdit;
