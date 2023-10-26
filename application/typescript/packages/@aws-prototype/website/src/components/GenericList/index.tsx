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
import Inline from 'aws-northstar/layouts/Inline';
import Button from 'aws-northstar/components/Button';
import {SolutionObjectBase} from '@aws-samples/bin-packing-shared-types';
import {generatePath, useNavigate} from 'react-router-dom';
import DeleteConfirmationDialog from 'components/DeleteConfirmationDialog';
import {APIRequest, useAPIDelete, useAPIGet} from 'api';

export interface TableComponentProps<T> {
  data: T[];
  tableActions: ReactNode;
  setSelectedRows: (rows: T[]) => void;
  loading?: boolean;
  errorText?: string;
}

export interface GenericListProps<T> {
  TableComponent: FC<TableComponentProps<T>>;
  listRequest: () => APIRequest;
  deleteRequest: () => APIRequest;
  routeCreate: string;
  routeUpdate: string;
  typeLabel: string;
}

const GenericList = <T extends SolutionObjectBase>({ routeCreate, routeUpdate, listRequest, deleteRequest, typeLabel, TableComponent }: GenericListProps<T>) => {
  const navigate = useNavigate();
  const [recordToBeDeleted, setRecordToBeDeleted] = useState<T>();
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const { data, isLoading, error } = useAPIGet<T[]>(listRequest());
  const { mutate: deleteData } = useAPIDelete(deleteRequest());
  const [selectedRows, setSelectedRows] = useState<T[]>();

  const handleCreate = useCallback(() => navigate(routeCreate), [navigate, routeCreate]);

  const handleUpdate = useCallback(
    (data: T) => {
      navigate(
        generatePath(routeUpdate, {
          id: data.Id || '',
        }),
      );
    },
    [navigate, routeUpdate],
  );

  const handleDelete = useCallback((data: T) => {
    setRecordToBeDeleted(data);
    setDeleteDialogVisible(true);
  }, []);

  const tableActions = useMemo(() => {
    return (
      <Inline>
        <Button disabled={selectedRows?.length !== 1} onClick={() => handleUpdate(selectedRows![0])}>
          Update
        </Button>
        <Button disabled={selectedRows?.length !== 1} onClick={() => handleDelete(selectedRows![0])}>
          Delete
        </Button>
        <Button variant="primary" onClick={handleCreate}>
          Add new {typeLabel}
        </Button>
      </Inline>
    );
  }, [handleCreate, handleDelete, handleUpdate, selectedRows, typeLabel]);

  return (
    <>
      <TableComponent
        data={data || []}
        tableActions={tableActions}
        setSelectedRows={setSelectedRows}
        loading={isLoading}
        errorText={error?.message}
      />
      {deleteDialogVisible && recordToBeDeleted && (
        <DeleteConfirmationDialog
          name={recordToBeDeleted.name}
          idObj={{ id: recordToBeDeleted.Id || '' }}
          visible={deleteDialogVisible}
          setVisible={setDeleteDialogVisible}
          mutate={deleteData}
        />
      )}
    </>
  );
};

export default GenericList;
