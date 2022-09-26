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
import { ShipmentContainer, ContainerType } from '@aws-prototype/shared-types';
import Table, { Column } from 'aws-northstar/components/Table';

export interface ShipmentContainerListProps {
  data: ShipmentContainer[];
  containerTypes: ContainerType[];
}

const ShipmentContainerList: FC<ShipmentContainerListProps> = ({ data, containerTypes }) => {
  const columnDefinitions: Column<ShipmentContainer>[] = useMemo(
    () => [
      {
        id: 'containerTypeId',
        width: 300,
        Header: 'Container Type',
        accessor: 'containerTypeId',
        Cell: ({ row }) => {
          const containerType = containerTypes.find((ct) => ct.Id === row.original.containerTypeId);
          return containerType?.name || row.original.containerTypeId;
        },
      },
      {
        id: 'quantity',
        width: 200,
        Header: 'Available Quantity',
        accessor: 'quantity',
      },
      {
        id: 'cost',
        width: 100,
        Header: 'Cost',
        accessor: 'cost',
      },
    ],
    [containerTypes],
  );

  return (
    <Table
      tableTitle={`Shipment Container Types (${data.length})`}
      columnDefinitions={columnDefinitions}
      items={data}
      multiSelect={false}
      disableRowSelect={true}
      disableFilters={true}
      disablePagination={true}
      disableSettings={true}
    />
  );
};

export default ShipmentContainerList;
