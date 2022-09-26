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
import { ItemType } from '@aws-prototype/shared-types';
import FormRenderer, { componentTypes, validatorTypes } from 'aws-northstar/components/FormRenderer';
import resourceTagsFormElement from 'config/resourceTagsFormElement';
import { EditFormComponentProps } from 'components/GenericEdit';
import dataTypes from '@data-driven-forms/react-form-renderer/data-types';

export interface ItemTypeFormType extends ItemType {
  requiredFeatureOptions: {label: string, value: string}[];
}

export interface AdditionalFormProps {
  features: string[];
}

const ItemTypeForm: FC<EditFormComponentProps<ItemType, AdditionalFormProps>> = ({ onSubmit, onCancel, initialValues, additionalProps }) => {
  const schema = useMemo(() => {
    return {
      name: 'itemTypeForm',
      header: initialValues ? `Item Type ${initialValues.name}` : 'Item Type',
      description: "An item can be a pallet or a box. Group pallets or boxes with same specifications into an item type", 
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          name: 'name',
          label: 'Name',
          isRequired: true,
          validate: [
            {
              type: validatorTypes.REQUIRED,
            },
          ],
        },
        {
          component: componentTypes.TEXTAREA,
          name: 'description',
          label: 'Description'
        },
        {
          component: componentTypes.TEXT_FIELD,
          name: 'weight',
          label: 'Weight (kg)',
          helperText: 'Weight in kg',
          isRequired: true,
          type: 'number',
          dataType: dataTypes.FLOAT,
          validate: [
            {
              type: validatorTypes.REQUIRED,
            },
          ],
        },
        {
          component: componentTypes.TEXT_FIELD,
          name: 'maxStackWeight',
          label: 'Maximum Stack Weight (kg)',
          description: 'Items within the specified weight limit can be stacked on top of this item. If no value provided, nothing can be stacked on top of this item',
          helperText: 'Weight in kg',
          isRequired: true,
          dataType: dataTypes.FLOAT,
          type: 'number',
        },
        {
          component: componentTypes.SWITCH,
          name: 'stackable',
          label: 'Stackable'
        },
        {
          component: componentTypes.TEXT_FIELD,
          name: 'dimension.length',
          label: 'Length (mm)',
          description: 'Length of item',
          helperText: 'Length in millimeters',
          isRequired: true,
          dataType: dataTypes.INTEGER,
          type: 'number',
          validate: [
            {
              type: validatorTypes.REQUIRED,
            },
          ],
        },
        {
          component: componentTypes.TEXT_FIELD,
          name: 'dimension.width',
          label: 'Width (mm)',
          description: 'Width of item',
          helperText: 'Width in millimeters',
          isRequired: true,
          type: 'number',
          dataType: dataTypes.INTEGER,
          validate: [
            {
              type: validatorTypes.REQUIRED,
            },
          ],
        },
        {
          component: componentTypes.TEXT_FIELD,
          name: 'dimension.height',
          label: 'Height (mm)',
          description: 'Height of item',
          helperText: 'Height in millimeters',
          isRequired: true,
          type: 'number',
          dataType: dataTypes.INTEGER,
          validate: [
            {
              type: validatorTypes.REQUIRED,
            },
          ],
        },
        {
          component: componentTypes.SELECT,
          name: 'requiredFeatureOptions',
          label: 'Choose container features that the item requires',
          placeholder: 'Choose features',
          multiSelect: true,
          options:
            additionalProps?.features.map((f) => ({
              label: f,
              value: f,
            })) || [],
        },
        ...resourceTagsFormElement
      ],
      submitLabel: initialValues ? 'Update' : 'Create'
    };
  }, [initialValues, additionalProps]);
  return <FormRenderer schema={schema} onSubmit={onSubmit} onCancel={onCancel} initialValues={initialValues} />;
};

export default ItemTypeForm;
