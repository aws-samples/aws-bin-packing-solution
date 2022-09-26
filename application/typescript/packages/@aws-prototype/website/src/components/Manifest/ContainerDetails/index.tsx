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
import { FC, ReactNode, useCallback, useMemo, useState } from 'react';
import Grid from 'aws-northstar/layouts/Grid';
import Box from 'aws-northstar/layouts/Box';
import Button from 'aws-northstar/components/Button';
import Table, { Column } from 'aws-northstar/components/Table';
import { PackingItem, ItemType, ContainerType, DisplayPackingItem } from '@aws-prototype/shared-types';
import ManifestLayout from '../Layout';
import BoxDetails from '../BoxDetails';

export interface ManifestContainerProps {
  packingItems: PackingItem[];
  itemTypesMap: { [key: string]: ItemType };
  containerId: string;
  containerType: ContainerType;
}

const generateRandomColor = () => `#${('00000'+(Math.random()*(1<<24)|0).toString(16)).slice(-6)}`;

const ManifestContainer: FC<ManifestContainerProps> = ({ packingItems, itemTypesMap, containerType, containerId }) => {
  const [highlightedItem, setHightLightedItem] = useState<string>();
  const [boxDetails, setBoxDetails] = useState<ReactNode>();

  const handleItemReset = useCallback(() => {
    setHightLightedItem(undefined);
    setBoxDetails(undefined);
  }, []);

  const columnDefinitions: Column<DisplayPackingItem>[] = useMemo(
    () => [
      {
        id: 'id',
        width: 100,
        Header: '',
        accessor: 'Id',
        Cell: ({ row }) => (
          <Button
            onClick={() => {
              setHightLightedItem(row.original.Id);
              setBoxDetails(<BoxDetails item={row.original} itemType={itemTypesMap[row.original.itemTypeId]} containerType={containerType} onReset={handleItemReset} />);
            }}
          >View</Button>
        ),
      },
      {
        id: 'color',
        width: 80,
        Header: 'Color',
        accessor: 'color',
        Cell: ({ row }) => <Box width="20px" height="20px" bgcolor={row.original.color} />,
      },
      {
        id: 'itemTypeId',
        width: 300,
        Header: 'Item Type',
        accessor: 'itemTypeId',
        Cell: ({ row }) => {
          const itemType = itemTypesMap[row.original.itemTypeId];
          return itemType?.name || row.original.itemTypeId;
        },
      },
      {
        id: 'coordinates',
        width: 200,
        Header: 'Coordinates',
        accessor: 'coordinates',
        Cell: ({ row }) => `${row.original.coordinates.x}, ${row.original.coordinates.y}, ${row.original.coordinates.z}`,
      },
    ],
    [itemTypesMap, handleItemReset, containerType],
  );

  const displayPackingItems: DisplayPackingItem[] = useMemo(() => {
    return packingItems.map((pi) => ({
      ...pi,
      color: generateRandomColor(),
    }));
  }, [packingItems]);

  const handleItemClick = useCallback((id: string, item: DisplayPackingItem, itemType: ItemType) => {
    setHightLightedItem(id);
    setBoxDetails(<BoxDetails item={item} itemType={itemType} containerType={containerType} onReset={handleItemReset} />);
  }, [handleItemReset, containerType]);

  const layout = useMemo(() => {
    return (
      <ManifestLayout
        packingItems={displayPackingItems}
        itemTypesMap={itemTypesMap}
        containerType={containerType}
        highlightedItem={highlightedItem}
        onItemClick={handleItemClick}
      />
    );
  }, [displayPackingItems, itemTypesMap, containerType, highlightedItem, handleItemClick]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        {boxDetails || (
          <Table
            tableTitle={`Container ${containerId} - ${containerType.name}`}
            columnDefinitions={columnDefinitions}
            items={displayPackingItems}
            multiSelect={false}
            disableRowSelect={true}
            disableFilters={true}
            disablePagination={false}
            disableSettings={true}
          />
        )}
      </Grid>
      <Grid item xs={8}>
        <Box width="100%" height="100%" minHeight="700px">
          {layout}
        </Box>
      </Grid>
    </Grid>
  );
};

export default ManifestContainer;
