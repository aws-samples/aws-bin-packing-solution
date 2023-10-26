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

import {FC, useCallback, useEffect, useState} from 'react';
import {UseMutationResult} from 'react-query';
import {v4 as uuidv4} from 'uuid';
import {SolutionObjectBase} from '@aws-samples/bin-packing-shared-types';

import {useAppLayoutContext} from 'aws-northstar/layouts/AppLayout';
import {useNavigate} from "react-router-dom";

export interface EditFormComponentProps<T, D = {}> {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialValues?: T;
  isSubmitting?: boolean;
  additionalProps?: D;
}

export interface GenericEditProps<T, D = {}> {
  FormComponent: FC<EditFormComponentProps<T, D>>;
  postProcess?: (data: any) => any;
  mutate: UseMutationResult<T, Error, T, unknown>['mutate'];
  initialValues?: T;
  additionalProps?: D;
}

const GenericEdit = <T extends SolutionObjectBase, D = {}>({ postProcess, mutate, initialValues, FormComponent, additionalProps }: GenericEditProps<T, D>) => {
  const navigate = useNavigate();
  const { addNotification, dismissNotifications } = useAppLayoutContext();
  const [, setNotificationId] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dismissNotification = useCallback(() => {
    setNotificationId((previousId) => {
      if (previousId) {
        dismissNotifications(previousId);
      }

      return undefined;
    });
  }, [dismissNotifications]);

  const handleSubmit = useCallback(
    (formData) => {
      const data =  postProcess?.(formData) || formData;
      dismissNotification();
      setIsSubmitting(true);
      mutate(data, {
        onSuccess: () => {
          setIsSubmitting(false);
          navigate(-1);
        },
        onError: (error) => {
          const id = uuidv4();
          setIsSubmitting(false);
          addNotification({
            id,
            type: 'error',
            header: `Error`,
            content: error.message,
            dismissible: true,
          });
          setNotificationId(id);
        },
      });
    },
    [dismissNotification, mutate, navigate, setNotificationId, addNotification, postProcess],
  );

  useEffect(() => {
    return () => {
      dismissNotification();
    };
  }, [dismissNotification]);

  const handleCancel = useCallback(() => navigate(-1), [navigate]);

  return (
    <FormComponent
      initialValues={initialValues}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      additionalProps={additionalProps}
    />
  );
};

export default GenericEdit;
