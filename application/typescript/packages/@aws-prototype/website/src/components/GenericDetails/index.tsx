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
import {FC, ReactNode, useCallback, useMemo, useState} from 'react';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import Inline from 'aws-northstar/layouts/Inline';
import Button from 'aws-northstar/components/Button';
import Stack from 'aws-northstar/layouts/Stack';
import Container from 'aws-northstar/layouts/Container';
import {SolutionObjectBase} from '@aws-prototype/shared-types';
import {APIRequest, useAPIDelete, useAPIGet} from 'api';
import QueryContainerTemplate from 'components/QueryContainerTemplate';
import ResourceTagsDetails from 'components/ResourceTagsDetails';
import DeleteConfirmationDialog from 'components/DeleteConfirmationDialog';

export interface DetailsComponentProps<T> {
  data: T;
}

export interface ActionProps<T> {
  label: string;
  loading: boolean;
  onClick: (data?: T) => void;
}

export interface GenericDetailsProps<T> {
  getRequest: (id: string) => APIRequest;
  DetailsComponent: FC<DetailsComponentProps<T>>;
  deleteRequest: () => APIRequest;
  routeUpdate: string;
  children?: (data: T) => ReactNode;
  mainAction?: ActionProps<T>;
}

const GenericDetails = <T extends SolutionObjectBase>({
  getRequest,
  DetailsComponent,
  routeUpdate,
  deleteRequest,
  children,
  mainAction
}: GenericDetailsProps<T>) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useAPIGet<T>(getRequest(id??''));
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const { mutate: deleteData } = useAPIDelete(deleteRequest());

  const handleUpdate = useCallback(() => {
    navigate(
      generatePath(routeUpdate,{id:id??''} ),
    );
  }, [navigate, routeUpdate, id]);

  const handleDelete = useCallback(() => {
    setDeleteDialogVisible(true);
  }, []);

  const actions = useMemo(() => {
    return (
      <Inline>
        <Button onClick={() => handleUpdate()}>Update</Button>
        <Button onClick={() => handleDelete()}>Delete</Button>
        {mainAction && <Button variant='primary' loading={mainAction.loading} onClick={() => mainAction.onClick(data)}>{mainAction.label}</Button>}
      </Inline>
    );
  }, [handleDelete, handleUpdate, mainAction, data]);

  return (
    <QueryContainerTemplate loading={isLoading} error={error} data={data}>
      {(data) => (
        <>
          <Stack>
            <Container title={data.name} actionGroup={actions}>
              <DetailsComponent data={data} />
            </Container>
            {data.tags && data.tags.length > 0 && (
              <Container title="Tags">
                <ResourceTagsDetails tags={data.tags} />
              </Container>
            )}
            {children && children(data)}
          </Stack>
          {deleteDialogVisible && data && (
            <DeleteConfirmationDialog
              name={data.name}
              idObj={{ id }}
              visible={deleteDialogVisible}
              setVisible={setDeleteDialogVisible}
              mutate={deleteData}
            />
          )}
        </>
      )}
    </QueryContainerTemplate>
  );
};

export default GenericDetails;
