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
import { FC, useEffect, useMemo, useState } from 'react';
import { Solver } from '@aws-prototype/shared-types';
import Table, { Column } from 'aws-northstar/components/Table';
import Inline from 'aws-northstar/layouts/Inline';
import Button from 'aws-northstar/components/Button';

export interface SolverListProps {
  data: Solver[];
  onClick: (solver: Solver) => void;
  loading?: boolean;
  errorText?: string;
}

const SolverList: FC<SolverListProps> = ({ data, onClick, loading, errorText }) => {
  const [selectedRows, setSelectedRows] = useState<Solver[]>([]);

  useEffect(() => {
    if (data) {
      const selected = data.filter((d) => d.selected);
      selected && setSelectedRows(selected);
    }
  }, [data]);

  const columnDefinitions: Column<Solver>[] = useMemo(
    () => [
      {
        id: 'solverName',
        width: 200,
        Header: 'Solver Name',
        accessor: 'name',
        Cell: ({ row }) => row.original.name || '-',
      },
      {
        id: 'solverArn',
        width: 200,
        Header: 'Solver ARN',
        accessor: 'arn',
        Cell: ({ row }) => row.original.arn || '-',
      },
    ],
    [],
  );

  const getRowId = (row: Solver) => {
    return row.arn;
  };

  const tableActions = useMemo(() => {
    return (
      <Inline>
        <Button variant="primary" disabled={selectedRows.length === 0} onClick={() => onClick(selectedRows[0])}>
          Update configured solver
        </Button>
      </Inline>
    );
  }, [selectedRows, onClick]);

  return (
    <Table
      tableTitle="Solvers"
      columnDefinitions={columnDefinitions}
      items={data}
      multiSelect={false}
      actionGroup={tableActions}
      onSelectionChange={setSelectedRows}
      selectedRowIds={selectedRows.map((row) => row.arn)}
      getRowId={getRowId}
      disableFilters={true}
      disablePagination={true}
      disableSettings={true}
      loading={loading}
      errorText={errorText}
      sortBy={[
        {
          id: 'solverName',
          desc: true,
        },
      ]}
    />
  );
};

export default SolverList;
