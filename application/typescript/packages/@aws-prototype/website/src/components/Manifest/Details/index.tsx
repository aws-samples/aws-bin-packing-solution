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
import Stack from 'aws-northstar/layouts/Stack';
import KeyValuePair from 'aws-northstar/components/KeyValuePair';
import ColumnLayout, { Column } from 'aws-northstar/layouts/ColumnLayout';
import { Manifest } from '@aws-samples/bin-packing-shared-types';
import formatDate from 'utils/formatDate';
import ManifestStatusComponent from '../Status';

export interface ManifestDetailsProps {
  data: Manifest;
}

const ManifestDetails: FC<ManifestDetailsProps> = ({ data }) => {
  return (
    <ColumnLayout>
      <Column>
        <Stack>
          <KeyValuePair label="Solver Name" value={data.solverLambdaName} />
          <KeyValuePair
            label="Status"
            value={<ManifestStatusComponent status={data.status}></ManifestStatusComponent>}
          />
          <KeyValuePair label="Started at" value={data.createdAt && formatDate(new Date(data.createdAt))} />
          <KeyValuePair label="Finished at" value={data.updatedAt && formatDate(new Date(data.updatedAt))} />
        </Stack>
      </Column>
      <Column>
        <Stack>
          <KeyValuePair label="Total Cost" value={data.totalCost} />
          {typeof data.hardScore !== 'undefined' && <KeyValuePair label="Hard Score" value={data.hardScore || '0'} />}
          {typeof data.softScore !== 'undefined' && <KeyValuePair label="Soft Score" value={data.softScore || '0'} />}
        </Stack>
      </Column>
      <Column>
        <Stack>
          <KeyValuePair label="Container Types #" value={data.containers?.length} />
          <KeyValuePair label="Item Types #" value={data.items?.length} />
        </Stack>
      </Column>
    </ColumnLayout>
  );
};

export default ManifestDetails;
