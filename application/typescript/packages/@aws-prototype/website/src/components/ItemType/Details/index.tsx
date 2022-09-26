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
import { ItemType } from '@aws-prototype/shared-types';
import ColumnLayout, { Column } from 'aws-northstar/layouts/ColumnLayout';
import KeyValuePair from 'aws-northstar/components/KeyValuePair';
import Stack from 'aws-northstar/layouts/Stack';
import { DetailsComponentProps } from 'components/GenericDetails';

const ItemTypeDetails: FC<DetailsComponentProps<ItemType>> = ({ data }) => {
  return (
    <ColumnLayout>
      <Column>
        <Stack>
          <KeyValuePair label="Description" value={data.description}/>
        </Stack>
      </Column>
      <Column>
        <Stack>
          <KeyValuePair label="Length (mm)" value={data.dimension.length}/>
          <KeyValuePair label="Width (mm)" value={data.dimension.width}/>
          <KeyValuePair label="Height (mm)" value={data.dimension.height}/>
        </Stack>
      </Column>
      <Column>
        <Stack>
          <KeyValuePair label="Weight (kg)" value={data.weight}/>
          <KeyValuePair label="Stackable" value={data.stackable ? 'Yes' : 'No'}/>
          <KeyValuePair label="Max Stack Weight (kg)" value={data.maxStackWeight}/>
        </Stack>
      </Column>
    </ColumnLayout>
  );
};

export default ItemTypeDetails;
