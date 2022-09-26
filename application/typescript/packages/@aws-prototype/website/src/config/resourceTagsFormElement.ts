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
import { componentTypes, validatorTypes } from 'aws-northstar/components/FormRenderer';

const resourceTagsFormElement = [{
    component: componentTypes.FIELD_ARRAY,
    label: 'Tags - optional',
    name: 'tags',
    buttonLabels: {
      add: 'Add tag'
    },
    fields: [
      {
        component: componentTypes.TEXT_FIELD,
        name: 'name',
        label: 'Name',
        validate: [
          {
            type: validatorTypes.REQUIRED,
          },
        ],
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'value',
        label: 'Value - optional',
      },
    ],
  }];

  export default resourceTagsFormElement;