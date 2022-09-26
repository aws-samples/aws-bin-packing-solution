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
import { ResourceTag } from '@aws-prototype/shared-types';
import ColumnLayout, { Column } from 'aws-northstar/layouts/ColumnLayout';
import KeyValuePair from 'aws-northstar/components/KeyValuePair';
import Stack from 'aws-northstar/layouts/Stack';

export interface ResourceTagsDetailsProps {
  tags: ResourceTag[];
}

const getColumnsContent = (tags: ResourceTag[], columnIndex: number, mod: number, avg: number) => {
    let tagIndex = 0;
    const startIndex = columnIndex < mod ? columnIndex * (avg + 1) : mod * (avg + 1) + (columnIndex - mod) * avg;
    const length =  columnIndex < mod ? avg + 1 : avg;
    return tags.slice(startIndex, startIndex + length).map(tag => (
        <KeyValuePair key={`${columnIndex}-${tagIndex}`} label={tag.name} value={tag.value}/>
      )
    );
}

const ResourceTagsDetails: FC<ResourceTagsDetailsProps> = ({ tags }) => {
  const tagsCount = tags.length;
  const columnsCount = tagsCount > 3 ? 3 : tagsCount;
  const mod = tagsCount % columnsCount;
  const avg = Math.floor(tagsCount / columnsCount);

  return (
    <ColumnLayout>
      {Array.from(Array(columnsCount).keys()).map(columnIndex => <Column key={columnIndex}>
        <Stack>
           {getColumnsContent(tags, columnIndex, mod, avg)}
        </Stack>
      </Column>)}
    </ColumnLayout>
  );

};

export default ResourceTagsDetails;
