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
import { Canvas } from '@react-three/fiber';
import { PresentationControls } from '@react-three/drei';
import { DisplayPackingItem, ItemType } from '@aws-samples/bin-packing-shared-types';
import Box, { BoxProps } from '../Box';
import Container, { ContainerProps } from '../Container';

export interface ContainerSpec {
  position: number[];
  dimension: number[];
}

export interface CameraFrustum {
  fov: number;
  far: number;
  near: number
}

export interface LayoutCanvasProps {
  spec: {
    boxes: BoxProps[];
    container: ContainerProps;
    cameraPosition: number[];
    cameraFrustum: CameraFrustum;
  };
  highlightedItem?: string;
  onItemClick: (id: string, item: DisplayPackingItem, itemType: ItemType) => void;
}

const LayoutCanvas: FC<LayoutCanvasProps> = ({ spec, highlightedItem, onItemClick }) => {
  return (
    <Canvas flat camera={{ fov: spec.cameraFrustum.fov, far: spec.cameraFrustum.far, near: spec.cameraFrustum.near, position: spec.cameraPosition }}>
      <ambientLight />
      <PresentationControls
        global
        zoom={1.2}
        rotation={[0, Math.PI / 4, 0]}
        polar={[-Math.PI / 4, Math.PI / 4]}
        azimuth={[-Infinity, Infinity]}
      >
        <Container {...spec.container}/>
        <group position={[0, 0, 0]} dispose={null}>
          {spec.boxes.map((box) => (
            <Box {...box} highlightedItem={highlightedItem} onClick={onItemClick}/>
          ))}
        </group>
      </PresentationControls>
    </Canvas>
  );
};

export default LayoutCanvas;
