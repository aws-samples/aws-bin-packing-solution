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
import { Shipment } from '@aws-samples/bin-packing-shared-types';
import Table, { Column } from 'aws-northstar/components/Table';
import Link from 'aws-northstar/components/Link';
import { generatePath } from 'react-router-dom';
import { ROUTE_SHIPMENT_DETAILS } from 'config/routes';
import { TableComponentProps } from 'components/GenericList';

const columnDefinitions: Column<Shipment>[] = [
  {
    id: 'name',
    width: 300,
    Header: 'Name',
    accessor: 'name',
    Cell: ({ row }) => (
      <Link
        href={generatePath(ROUTE_SHIPMENT_DETAILS, {
          id: row.original.Id || '',
        })}
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    id: 'containers',
    width: 200,
    Header: 'Container Types #',
    Cell: ({ row }: any) => row?.original?.containers?.length || ''
  },
  {
    id: 'items',
    width: 200,
    Header: 'Item Types #',
    Cell: ({ row }: any) => row?.original?.items?.length || ''
  },
  {
    id: 'description',
    width: 400,
    Header: 'Description',
    accessor: 'description',
  },
];

const ShipmentList: FC<TableComponentProps<Shipment>> = ({ data, tableActions, setSelectedRows }) => {
  return (
    <Table
      tableTitle="Shipments"
      columnDefinitions={columnDefinitions}
      items={data}
      multiSelect={false}
      actionGroup={tableActions}
      onSelectionChange={setSelectedRows}
    />
  );
};

export default ShipmentList;
