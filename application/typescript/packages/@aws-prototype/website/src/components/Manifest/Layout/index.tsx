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
import { DisplayPackingItem, ItemType, ContainerType, Dimension, Coordinate } from '@aws-prototype/shared-types';
import Canvas from './components/Canvas';
import { BoxProps } from './components/Box';

export interface ManifestLayoutProps {
  packingItems: DisplayPackingItem[];
  itemTypesMap: { [key: string]: ItemType };
  containerType: ContainerType;
  highlightedItem?: string;
  onItemClick: (id: string, item: DisplayPackingItem, itemType: ItemType) => void;
}

const covertDimension = (dimension: Dimension): number[] => {
  return [dimension.length, dimension.height, dimension.width];
};

const covertCoordinate = (coordinate: Coordinate): number[] => {
  return [-coordinate.x, coordinate.y, coordinate.z];
};

const ManifestLayout: FC<ManifestLayoutProps> = ({
  packingItems,
  itemTypesMap,
  containerType,
  highlightedItem,
  onItemClick,
}) => {
  const spec = useMemo(() => {
    const containerDim = covertDimension(containerType.dimension);
    const container = {
      position: [0, 0, 0],
      dimension: [...containerDim, 10, 10, 10],
    };

    const { height, width, length } = containerType.dimension;

    const max = Math.max(height, width, length);
    const distance = max / 2; // considering rotation

    var diag = Math.sqrt(height * height + length * length);
    var fov = 2 * Math.atan(diag / (2 * distance)) * (180 / Math.PI);

    const cameraFrustum = {
      fov,
      far: max * 1.5,
      near: 0.1,
    };

    const cameraPosition = [0, height / 2, width * 2];

    const boxes: BoxProps[] = [];

    packingItems.forEach((pi) => {
      const itemType = itemTypesMap[pi.itemTypeId];
      const boxDimension = covertDimension(pi.packingDimension);
      if (itemType) {
        boxes.push({
          id: pi.Id,
          position: covertCoordinate(pi.coordinates),
          dimension: boxDimension,
          item: pi,
          itemType,
        });
      }
    });

    return {
      container,
      boxes,
      cameraPosition,
      cameraFrustum,
    };
  }, [packingItems, itemTypesMap, containerType]);
  return <Canvas spec={spec} highlightedItem={highlightedItem} onItemClick={onItemClick} />;
};

export default ManifestLayout;
