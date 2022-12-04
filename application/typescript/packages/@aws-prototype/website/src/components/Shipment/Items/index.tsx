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
import {ItemType, ShipmentItem, UnpackedItem} from '@aws-prototype/shared-types';
import Table, {Column} from 'aws-northstar/components/Table';
import Badge from 'aws-northstar/components/Badge';
import Box from 'aws-northstar/layouts/Box';

export interface ShipmentItemListProps {
  data: ShipmentItem[];
  itemTypes: ItemType[];
  unpackedItems?: UnpackedItem[];
}

const ShipmentItemList: FC<ShipmentItemListProps> = ({ data, itemTypes, unpackedItems }) => {
  var columnDefinitions: Column<ShipmentItem>[] = useMemo(() => {
    const result: Column<ShipmentItem>[] = [
      {
        id: 'itemTypeId',
        width: 300,
        Header: 'Item Type',
        accessor: 'itemTypeId',
        Cell: ({ row }) => {
          const itemType = itemTypes.find((it) => it.Id === row.original.itemTypeId);
          return <>{itemType?.name || row.original.itemTypeId}</>;
        },
      },
      {
        id: 'quantity',
        width: 100,
        Header: 'Quantity',
        accessor: 'quantity',
      },
    ];
    if (unpackedItems) {
      result.push({
        id: 'unpackedQuantity',
        width: 180,
        Header: 'Unpacked Quantity',
        accessor: 'quantity',
        Cell: ({ row }) => {
          const unpackedItem = unpackedItems?.find((it) => it.itemTypeId === row.original.itemTypeId);
          return (
            <Box width='100%' marginLeft={5}>
              {unpackedItem && unpackedItem?.quantity > 0 ? (
                <Badge content={unpackedItem.quantity} color="red" />
              ) : (
                <Badge content="0" color="green" />
              )}
            </Box>
          );
        },
      });
    }
    return result;
  }, [itemTypes, unpackedItems]);

  return (
    <Table
      tableTitle={`Shipment Item Types (${data.length})`}
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

export default ShipmentItemList;
