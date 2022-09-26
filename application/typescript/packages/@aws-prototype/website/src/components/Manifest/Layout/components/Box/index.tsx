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
import { FC, useCallback, useRef, useState, useMemo } from 'react';
import { NORTHSTAR_COLORS } from 'aws-northstar/config/color';
import { DisplayPackingItem, ItemType } from '@aws-prototype/shared-types';

export interface BoxProps {
  id: string;
  position: number[];
  dimension: number[];
  itemType: ItemType;
  item: DisplayPackingItem;
  onClick?: (id: string, item: DisplayPackingItem, itemType: ItemType) => void;
  highlightedItem?: string;
}

const Box: FC<BoxProps> = ({ position, dimension, id, itemType, item, onClick, highlightedItem }) => {
  const ref = useRef();
  const [hovered, hover] = useState(false);

  const handleClick = useCallback(() => {
    onClick?.(id, item, itemType);
  }, [onClick, id, item, itemType]);

  const props = useMemo(() => highlightedItem === id ? {
    transparent: false,
    opacity: 1,
  } : (highlightedItem ? {
    transparent: true, 
    opacity: 0.2  } : {
    transparent: true, 
    opacity: 0.5
  }), [highlightedItem, id]);

  return (
    <mesh
      position={position}
      ref={ref}
      onClick={handleClick}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
    >
      <boxGeometry args={dimension} />
      <meshStandardMaterial color={hovered ? NORTHSTAR_COLORS.ORANGE_DARK : item.color} {...props}/>
    </mesh>
  );
};

export default Box;
