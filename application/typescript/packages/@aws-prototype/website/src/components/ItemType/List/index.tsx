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
import { generatePath } from 'react-router-dom';
import { ItemType } from '@aws-prototype/shared-types';
import Table, { Column } from 'aws-northstar/components/Table';
import Link from 'aws-northstar/components/Link';
import Badge from 'aws-northstar/components/Badge';
import Inline from 'aws-northstar/layouts/Inline';
import Checkbox from 'aws-northstar/components/Checkbox';
import { TableComponentProps } from 'components/GenericList';
import { ROUTE_ITEM_TYPE_DETAILS } from 'config/routes';

const columnDefinitions: Column<ItemType>[] = [
  {
    id: 'name',
    width: 300,
    Header: 'Name',
    accessor: 'name',
    Cell: ({ row }) => (<Link href={generatePath(ROUTE_ITEM_TYPE_DETAILS, {
      id: row.original.Id || ''
    })}>{row.original.name}</Link>)
  },
  {
    id: 'maxStackWeight',
    width: 200,
    Header: 'Max Stack Weight (kg)',
    accessor: (row) => row.maxStackWeight || 0,
  },
  {
    id: 'stackable',
    width: 150,
    Header: 'Stackable',
    accessor: 'stackable',
    Cell: ({ row }) => (<Checkbox checked={row.original.stackable} disabled/>)
  },
  {
    id: 'weight',
    width: 150,
    Header: 'Weight (kg)',
    accessor: 'weight',
  },
  {
    id: 'length',
    width: 150,
    Header: 'Length (mm)',
    accessor: (row) => row.dimension.length,
  },
  {
    id: 'width',
    width: 150,
    Header: 'Width (mm)',
    accessor: (row) => row.dimension.width,
  },
  {
    id: 'height',
    width: 150,
    Header: 'Height (mm)',
    accessor: (row) => row.dimension.height,
  },
  {
    id: 'requiredFeatures',
    width: 300,
    Header: 'Required Features',
    accessor: 'requiredFeatures',
    Cell: ({ row }) => (row.original.requiredFeatures? <Inline>{row.original.requiredFeatures.map(feature => <Badge key={feature} color='blue' content={feature}/>)}</Inline> : '')
  },
  {
    id: 'description',
    width: 400,
    Header: 'Description',
    accessor: 'description',
  },
];

const ItemTypeList: FC<TableComponentProps<ItemType>> = ({ data, tableActions, setSelectedRows, loading, errorText }) => {
  return (
    <Table
      tableTitle="Item Types"
      columnDefinitions={columnDefinitions}
      items={data}
      multiSelect={false}
      actionGroup={tableActions}
      onSelectionChange={setSelectedRows}
      loading={loading}
      errorText={errorText}
    />
  );
};

export default ItemTypeList;
