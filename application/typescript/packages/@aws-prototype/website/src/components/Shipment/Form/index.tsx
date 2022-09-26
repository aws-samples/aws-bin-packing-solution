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
import { ContainerType, ItemType, Shipment } from '@aws-prototype/shared-types';
import FormRenderer, { componentTypes, validatorTypes } from 'aws-northstar/components/FormRenderer';
import resourceTagsFormElement from 'config/resourceTagsFormElement';
import { EditFormComponentProps } from 'components/GenericEdit';
import dataTypes from '@data-driven-forms/react-form-renderer/data-types';

export interface ShipmentFormAdditionalProps {
  containerTypes: ContainerType[];
  itemTypes: ItemType[];
}

const ContainerForm: FC<EditFormComponentProps<Shipment, ShipmentFormAdditionalProps>> = ({ onSubmit, onCancel, initialValues, additionalProps}) => {
  const schema = useMemo(() => {
    return {
      name: 'shipmentForm',
      header: initialValues ? `Shipment ${initialValues.name}` : 'Shipment',
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
          label: 'Description',
        },
        {
          component: componentTypes.FIELD_ARRAY,
          label: 'Available Container Types',
          name: 'containers',
          minItems: 1,
          buttonLabels: {
            add: 'Add container type'
          },
          validate: [
            {
              type: validatorTypes.MIN_ITEMS,
              threshold: 1,
            },
            {
              type: validatorTypes.REQUIRED,
            },
          ],
          fields: [
            {
              component: componentTypes.SELECT,
              name: 'containerTypeId',
              label: 'Container Type',
              placeholder: 'Choose container type',
              options: additionalProps?.containerTypes.map(c => ({
                value: c.Id,
                label: c.name
              })),
              validate: [
                {
                  type: validatorTypes.REQUIRED,
                },
              ],
            },
            {
              component: componentTypes.TEXT_FIELD,
              name: 'quantity',
              label: 'Quantity',
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
              name: 'cost',
              label: 'Cost',
              type: 'number',
              dataType: dataTypes.FLOAT,
              validate: [
                {
                  type: validatorTypes.REQUIRED,
                },
              ],
            }
          ],
        },
        {
          component: componentTypes.FIELD_ARRAY,
          label: 'Items',
          name: 'items',
          minItems: 1,
          buttonLabels: {
            add: 'Add item'
          },
          validate: [
            {
              type: validatorTypes.MIN_ITEMS,
              threshold: 1,
            },
            {
              type: validatorTypes.REQUIRED,
            },
          ],
          fields: [
            {
              component: componentTypes.SELECT,
              name: 'itemTypeId',
              label: 'Item Type',
              placeholder: 'Choose item type',
              options: additionalProps?.itemTypes.map(c => ({
                value: c.Id,
                label: c.name
              })),
              validate: [
                {
                  type: validatorTypes.REQUIRED,
                },
              ],
            },
            {
              component: componentTypes.TEXT_FIELD,
              name: 'quantity',
              label: 'Quantity',
              type: 'number',
              dataType: dataTypes.INTEGER,
              validate: [
                {
                  type: validatorTypes.REQUIRED,
                },
              ],
            },
          ],
        },
        ...resourceTagsFormElement,
      ],
      submitLabel: initialValues ? 'Update' : 'Create',
    };
  }, [initialValues, additionalProps]);
  return <FormRenderer schema={schema} onSubmit={onSubmit} onCancel={onCancel} initialValues={initialValues} />;
};

export default ContainerForm;
