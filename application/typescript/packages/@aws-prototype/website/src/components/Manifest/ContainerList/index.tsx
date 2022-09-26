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
import { FC, useMemo } from 'react';
import { generatePath } from 'react-router-dom';
import Button from 'aws-northstar/components/Button';
import Table, { Column } from 'aws-northstar/components/Table';
import Link from 'aws-northstar/components/Link';
import { PackingItem } from '@aws-prototype/shared-types';
import { ROUTE_CONTAINER_TYPE_DETAILS } from 'config/routes';

export interface ManifestContainer {
  Id: string;
  containerTypeId: string;
  containerType: string;
  packingItems: PackingItem[];
}

export interface ManifestContainerListProps {
  data: ManifestContainer[];
  onClick: (id: string) => void;
}

const ManifestContainerList: FC<ManifestContainerListProps> = ({ data, onClick }) => {
  const columnDefinitions: Column<ManifestContainer>[] = useMemo(
    () => [
      {
        id: 'id',
        width: 200,
        Header: '',
        accessor: 'Id',
        Cell: ({ row }) => (
          <Button
            onClick={() => {
              onClick(row.original.Id || '');
            }}
          >
            View Layout
          </Button>
        ),
      },
      {
        id: 'containerType',
        width: 200,
        Header: 'Container Type',
        accessor: 'containerType',
        Cell: ({ row }) => (
          <Link
            href={generatePath(ROUTE_CONTAINER_TYPE_DETAILS, {
              id: row.original.containerTypeId,
            })}
          >
            {row.original.containerType}
          </Link>
        ),
      },
      {
        id: 'packingItems',
        width: 200,
        Header: 'Packing Items #',
        accessor: 'packingItems',
        Cell: ({ row }) => row.original.packingItems?.length || 0,
      },
    ],
    [onClick],
  );

  return (
    <Table
      tableTitle={`Containers (${data.length})`}
      columnDefinitions={columnDefinitions}
      items={data}
      disablePagination={false}
      disableRowSelect={true}
      disableFilters={true}
    />
  );
};

export default ManifestContainerList;
