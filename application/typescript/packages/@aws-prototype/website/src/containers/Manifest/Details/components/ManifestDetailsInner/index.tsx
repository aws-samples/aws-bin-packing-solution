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
import { FC, useEffect, useCallback, useMemo } from 'react';
import Container from 'aws-northstar/layouts/Container';
import Stack from 'aws-northstar/layouts/Stack';
import { useAppLayoutContext } from 'aws-northstar/layouts/AppLayout';
import { ContainerType, ItemType, Manifest, Shipment, PackingItem } from '@aws-prototype/shared-types';
import { useAPIGet, listContainerTypesRequest, getShipmentRequest, getItemTypeRequest } from 'api';
import ManifestDetailsComponent from 'components/Manifest/Details';
import ManifestContainerDetails from 'components/Manifest/ContainerDetails';
import ManifestContainerList, { ManifestContainer } from 'components/Manifest/ContainerList';
import ShipmentContainers from 'components/Shipment/Containers';
import ShipmentItems from 'components/Shipment/Items';
import useParallelGet from 'api/hooks/useParallelGet';

export interface ManifestDetailsInnerProps {
  data: Manifest;
  shipmentId: string;
}

const ManifestDetailsInner: FC<ManifestDetailsInnerProps> = ({ data, shipmentId }) => {
  const { openSplitPanel, setSplitPanelContent, setDefaultSplitPanelHeight } = useAppLayoutContext();
  const { data: shipment } = useAPIGet<Shipment>(getShipmentRequest(shipmentId));
  const { data: containerTypes, isSuccess: isContainerTypesSuccess } = useAPIGet<ContainerType[]>(
    listContainerTypesRequest(),
  );
  const itemTypesResult = useParallelGet<ItemType>(
    data.items.map((i) => i.itemTypeId).map((itid) => getItemTypeRequest(itid)),
  );

  useEffect(() => {
    setDefaultSplitPanelHeight(800);
    return () => {
      openSplitPanel(false);
    };
  }, [setDefaultSplitPanelHeight, openSplitPanel]);

  const itemTypes = useMemo(() => {
    if (itemTypesResult.every((r) => r.isSuccess)) {
      return itemTypesResult.map((r) => r.data).filter((x) => !!x) as ItemType[];
    }

    return undefined;
  }, [itemTypesResult]);

  const containersMap = useMemo(() => {
    return (
      data?.packingItems?.reduce(
        (
          rv: {
            [key: string]: PackingItem[];
          },
          pt: PackingItem,
        ) => {
          (rv[pt.packingContainerId] = rv[pt.packingContainerId] || []).push(pt);
          return rv;
        },
        {},
      ) || {}
    );
  }, [data]);

  const containers: ManifestContainer[] = useMemo(() => {
    if (data && isContainerTypesSuccess && containerTypes) {
      const containerIds = Object.keys(containersMap);
      if (containerIds.length > 0) {
        const containers: ManifestContainer[] = [];
        containerIds.forEach((id) => {
          const packingContainer = data?.packingContainers?.find((pc) => pc.Id === id);
          if (packingContainer) {
            const containerType = containerTypes.find((ct) => ct.Id === packingContainer.containerTypeId);
            if (containerType && containerType.Id) {
              containers.push({
                Id: id,
                containerType: containerType.name,
                containerTypeId: containerType.Id,
                packingItems: containersMap[id] || [],
              });
            }
          }
          return null;
        });

        return containers;
      }
    }
    return [];
  }, [data, containersMap, containerTypes, isContainerTypesSuccess]);

  const itemTypesMap = useMemo(() => {
    const itemTypesMap =
      itemTypes?.reduce(
        (
          rv: {
            [key: string]: ItemType;
          },
          it: ItemType,
        ) => {
          rv[it.Id || ''] = it;
          return rv;
        },
        {},
      ) || {};

    return itemTypesMap;
  }, [itemTypes]);

  const handleContainerClick = useCallback(
    (containerId: string) => {
      const packingItems = containersMap[containerId];
      if (packingItems) {
        const container = containers?.find((c) => c.Id === containerId);
        if (container) {
          const containerType = containerTypes?.find((ct) => ct.Id === container.containerTypeId);
          if (containerType) {
            setSplitPanelContent(
              <ManifestContainerDetails
                packingItems={packingItems}
                itemTypesMap={itemTypesMap}
                containerType={containerType}
                containerId={containerId}
              />,
            );
            openSplitPanel(true);
          }
        }
      }
    },
    [containers, containersMap, containerTypes, setSplitPanelContent, openSplitPanel, itemTypesMap],
  );

  return (
    <Stack>
      <Container title={`Manifest ${data.Id} for Shipment ${shipment?.name}`}>
        <ManifestDetailsComponent data={data} />
      </Container>
      {containers && containers.length > 0 && (
        <ManifestContainerList data={containers} onClick={handleContainerClick}></ManifestContainerList>
      )}
      <ShipmentContainers data={data.containers} containerTypes={containerTypes || []} />
      <ShipmentItems data={data.items} itemTypes={itemTypes || []} unpackedItems={data.unpackedItems || []} />
    </Stack>
  );
};

export default ManifestDetailsInner;
