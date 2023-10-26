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
import {FC, useMemo} from 'react';
import {Manifest} from '@aws-samples/bin-packing-shared-types';
import Button from 'aws-northstar/components/Button';
import Table, {Column} from 'aws-northstar/components/Table';
import Status from '../Status';
import formatDate from "../../../utils/formatDate";

export interface ManifestListProps {
  data: Manifest[];
  onClick: (id: string) => void;
  loading?: boolean;
  errorText?: string;
}

const ManifestList: FC<ManifestListProps> = ({ data, onClick, loading, errorText }) => {
  const columnDefinitions: Column<Manifest>[] = useMemo(
    () => [
      {
        id: 'id',
        width: 200,
        Header: '',
        accessor: 'Id',
        Cell: ({ row }) =>
          row.original.status === 'Complete' || row.original.status === 'Error' ? (
            <Button
              onClick={() => {
                onClick(row.original.Id || '');
              }}
            >
              View Details
            </Button>
          ) : (
            <></>
          ),
      },
      {
        id: 'createdAt',
        width: 200,
        Header: 'Started at',
        accessor: 'createdAt',
        Cell: ({ row }) => <>{(row.original.createdAt && formatDate(new Date(row.original.createdAt))) || '-'}</>,
      },
      {
        id: 'updatedAt',
        width: 200,
        Header: 'Finished at',
        accessor: 'updatedAt',
        Cell: ({ row }) => <>{(row.original.updatedAt && formatDate(new Date(row.original.updatedAt))) || '-' }</>,
      },
      {
        id: 'status',
        width: 200,
        Header: 'Status',
        accessor: 'status',
        Cell: ({ row }) => <Status status={row.original.status} />,
      },
      {
        id: 'totalCost',
        width: 200,
        Header: 'Total Cost',
        accessor: 'totalCost',
        Cell: ({ row }) => <>{(row.original.totalCost ? `$${row.original.totalCost}` : '-')}</>,
      },
      {
        id: 'hardScore',
        width: 200,
        Header: 'Hard Score',
        accessor: 'hardScore',
        Cell: ({ row }) => <>{(row.original.hardScore || '-')}</>,
      },
      {
        id: 'softScore',
        width: 200,
        Header: 'Soft Score',
        accessor: 'softScore',
        Cell: ({ row }) => <>{(row.original.softScore || '-')}</>,
      },
      {
        id: 'totalItems',
        width: 200,
        Header: 'Total Items #',
        accessor: 'packingItems',
        Cell: ({ row }) => <>{(row.original.packingItems? row.original.packingItems.length : '-')}</>,
      },
      {
        id: 'totalContainers',
        width: 200,
        Header: 'Total Containers #',
        accessor: 'packingContainers',
        Cell: ({ row }) => <>{row.original.packingItems? new Set(row.original.packingItems.map(pi => pi.packingContainerId)).size : '-'}</>,
      },
      {
        id: 'totalItemTypes',
        width: 200,
        Header: 'Total Item Types #',
        accessor: 'items',
        Cell: ({ row }) => <>{(row.original.items?.length || '-')}</>,
      },
      {
        id: 'totalContainerTypes',
        width: 200,
        Header: 'Total Container Types #',
        accessor: 'containers',
        Cell: ({ row }) => <>{(row.original.containers?.length || '-')}</>,
      },
    ],
    [onClick],
  );

  return (
    <Table
      tableTitle="Packing Manifests"
      columnDefinitions={columnDefinitions}
      items={data}
      multiSelect={false}
      disableRowSelect={true}
      disableFilters={true}
      loading={loading}
      errorText={errorText}
      sortBy={[{
        id: 'createdAt',
        desc: true
      }]}
    />
  );
};

export default ManifestList;
