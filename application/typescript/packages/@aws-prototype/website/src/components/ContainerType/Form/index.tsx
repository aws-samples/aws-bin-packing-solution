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
import FormRenderer, { componentTypes, validatorTypes } from 'aws-northstar/components/FormRenderer';
import resourceTagsFormElement from 'config/resourceTagsFormElement';
import { EditFormComponentProps } from 'components/GenericEdit';
import { ContainerType } from '@aws-prototype/shared-types';
import dataTypes from '@data-driven-forms/react-form-renderer/data-types';

export interface AdditionalFormProps {
  features: string[];
}

export interface ContainerTypeFormType extends ContainerType {
  featureOptions: {label: string, value: string}[];
}

const ContainerTypeForm: FC<EditFormComponentProps<ContainerType, AdditionalFormProps>> = ({
  isSubmitting,
  onSubmit,
  onCancel,
  initialValues,
  additionalProps,
}) => {
  const schema = useMemo(() => {
    return {
      name: 'containerTypeForm',
      header: initialValues ? `Container Type ${initialValues.name}` : 'Container Type',
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
          component: componentTypes.TEXT_FIELD,
          name: 'maxWeight',
          label: 'Payload (kg)',
          description: 'Maximum Weight Loaded (Maximum Gross Weight - Tare)',
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
          name: 'dimension.length',
          label: 'Length (mm)',
          description: 'Length of the interior Dimensions',
          helperText: 'Length in millimeters',
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
          name: 'dimension.width',
          label: 'Width (mm)',
          description: 'Width of the interior Dimensions',
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
          description: 'Height of the interior Dimensions',
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
          name: 'featureOptions',
          label: 'Choose or add features that the container supports',
          placeholder: 'Choose or add features',
          multiSelect: true,
          freeSolo: true,
          options:
            additionalProps?.features.map((f) => ({
              label: f,
              value: f,
            })) || [],
        },
        ...resourceTagsFormElement,
      ],
      submitLabel: initialValues ? 'Update' : 'Create',
    };
  }, [initialValues, additionalProps]);
  return (
    <FormRenderer
      schema={schema}
      onSubmit={onSubmit}
      onCancel={onCancel}
      initialValues={initialValues}
      isSubmitting={isSubmitting}
    />
  );
};

export default ContainerTypeForm;
