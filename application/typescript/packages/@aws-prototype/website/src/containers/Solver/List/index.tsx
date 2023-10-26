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
import { FC, useCallback, useState } from 'react';
import SolverListComponent from 'components/Solver/List';
import { listSolversRequest, updateSolverSettingsRequest, useAPIGet, useAPIPost } from 'api';
import { Solver } from '@aws-samples/bin-packing-shared-types';
import { useAppLayoutContext } from 'aws-northstar/layouts/AppLayout';
import { v4 as uuidv4 } from 'uuid';

const SolversList: FC = () => {
  const { mutate: updateSolver } = useAPIPost<Solver, Solver>(updateSolverSettingsRequest());
  const { data, isLoading, error } = useAPIGet<Solver[]>(listSolversRequest());
  const { addNotification, dismissNotifications } = useAppLayoutContext();
  const [, setNotificationId] = useState<string>();

  const dismissNotification = useCallback(() => {
    setNotificationId((previousId) => {
      if (previousId) {
        dismissNotifications(previousId);
      }

      return undefined;
    });
  }, [dismissNotifications]);

  const handleClick = useCallback(
    (data) => {
      if (data) {
        dismissNotification();
      }
      const solverName = data.name;
      const notificationId = uuidv4();
      updateSolver(data, {
        onSuccess: (data) => {
          addNotification({
            id: notificationId,
            type: 'info',
            header: `Request ${notificationId} submitted`,
            content: `Configured solver successfully set to ${solverName}`,
            dismissible: true,
          });
          setNotificationId(notificationId);
        },
        onError: (error) => {
          addNotification({
            id: notificationId,
            type: 'error',
            header: `Error`,
            content: error.message,
            dismissible: true,
          });
          setNotificationId(notificationId);
        },
      });
    },
    [updateSolver, addNotification, dismissNotification],
  );
  return <SolverListComponent onClick={handleClick} data={data || []} loading={isLoading} errorText={error?.message} />;
};

export default SolversList;
