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
import { ContainerType, DisplayPackingItem, ItemType } from '@aws-samples/bin-packing-shared-types';
import Box from 'aws-northstar/layouts/Box';
import Stack from 'aws-northstar/layouts/Stack';
import Container from 'aws-northstar/layouts/Container';
import Close from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import KeyValuePair from 'aws-northstar/components/KeyValuePair';
import Toggle from 'aws-northstar/components/Toggle';
import Text from 'aws-northstar/components/Text';
import Badge from 'aws-northstar/components/Badge';
import ColumnLayout, { Column } from 'aws-northstar/layouts/ColumnLayout';

export interface BoxDetailsProps {
  item: DisplayPackingItem;
  itemType: ItemType;
  containerType: ContainerType;
  onReset: () => void;
}

const BoxDetails: FC<BoxDetailsProps> = ({ item, itemType, containerType, onReset }) => {
  return (
    <Box>
      <Box width="100%" textAlign="right">
        <IconButton onClick={onReset}>
          <Close />
        </IconButton>
      </Box>
      <Container title={item.Id}>
        <Stack>
          <KeyValuePair label="Item Type" value={itemType.name} />
          <KeyValuePair label="Container" value={containerType.name} />
          <ColumnLayout>
            <Column>
              <Stack>
                <KeyValuePair label="Weight" value={`${itemType.weight} kg`} />
                <KeyValuePair
                  label="Dimension"
                  value={
                    <Text>
                      Length: {itemType.dimension.length} mm <br />
                      Width: {itemType.dimension.width} mm <br />
                      Height: {itemType.dimension.height} mm
                    </Text>
                  }
                />
                <KeyValuePair
                  label="Coordinate"
                  value={`[${item.coordinates.x}, ${item.coordinates.y}, ${item.coordinates.z}]`}
                />
              </Stack>
            </Column>
            <Column>
              <Stack>
                <KeyValuePair label="Maximum Stack Weight" value={itemType.maxStackWeight} />
                <KeyValuePair label="Stackable" value={<Toggle checked={itemType.stackable} disabled label="" />} />
                <KeyValuePair label="Color" value={<Box width="20px" height="20px" bgcolor={item.color} />} />
                <KeyValuePair
                  label="Required Features"
                  value={itemType.requiredFeatures?.map((f) => (
                    <Badge color="blue" content={f} />
                  ))}
                />
              </Stack>
            </Column>
          </ColumnLayout>
        </Stack>
      </Container>
    </Box>
  );
};

export default BoxDetails;
