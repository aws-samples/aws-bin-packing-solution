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
import {ContainerType} from '@aws-prototype/shared-types';
import Table, {Column} from 'aws-northstar/components/Table';
import Link from 'aws-northstar/components/Link';
import Badge from 'aws-northstar/components/Badge';
import Inline from 'aws-northstar/layouts/Inline';
import {generatePath} from 'react-router-dom';
import {ROUTE_CONTAINER_TYPE_DETAILS} from 'config/routes';
import {TableComponentProps} from 'components/GenericList';

const columnDefinitions: Column<ContainerType>[] = [
  {
    id: 'name',
    width: 300,
    Header: 'Name',
    accessor: 'name',
    Cell: ({ row }) => (<Link href={generatePath(ROUTE_CONTAINER_TYPE_DETAILS, {
      id: row.original.Id || ''
    })}>{row.original.name}</Link>)
  },
  {
    id: 'maxWeight',
    width: 200,
    Header: 'Payload (kg)',
    accessor: 'maxWeight',
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
    id: 'features',
    width: 300,
    Header: 'Features',
    accessor: 'features',
    Cell: ({ row }) => (row.original.features? <Inline>{row.original.features.map(feature => <Badge key={feature} color='blue' content={feature}/>)}</Inline> :<></>)
  },
  {
    id: 'description',
    width: 400,
    Header: 'Description',
    accessor: 'description',
  },
];

const ContainerList: FC<TableComponentProps<ContainerType>> = ({ data, tableActions, setSelectedRows, loading, errorText }) => {
  return (
    <Table
      tableTitle="Container Types"
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

export default ContainerList;
