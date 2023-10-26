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

import {FC, useCallback, useMemo, useState} from 'react';
import ShipmentContainerList from 'components/Shipment/Containers';
import ShipmentItemList from 'components/Shipment/Items';
import ShipmentDetailsComponent from 'components/Shipment/Details';
import GenericDetails from 'components/GenericDetails';
import {
  createManifestRequest,
  deleteShipmentRequest,
  getShipmentRequest,
  listContainerTypesRequest,
  listItemTypesRequest,
  subscribeManifestUpdateForShipmentRequest,
  useAPIGet,
  useAPIPost,
  useSubscription,
} from 'api';
import ManifestListContainer from 'containers/Manifest/List';
import {ContainerType, ItemType, Manifest, Shipment} from '@aws-samples/bin-packing-shared-types';
import Stack from 'aws-northstar/layouts/Stack';
import {ROUTE_SHIPMENT_MANIFEST_DETAILS, ROUTE_SHIPMENT_UPDATE} from 'config/routes';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import {useAppLayoutContext} from 'aws-northstar/layouts/AppLayout';
import {v4 as uuidv4} from 'uuid';

const ShipmentDetails: FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: containerTypes } = useAPIGet<ContainerType[]>(listContainerTypesRequest());
  const { data: itemTypes } = useAPIGet<ItemType[]>(listItemTypesRequest());
  const { mutate: createManifest } = useAPIPost<Manifest, string>(createManifestRequest(id ?? ''));
  const [isRequesting, setIsRequesting] = useState(false);
  const [, setNotificationId] = useState<string>();
  const { addNotification, dismissNotifications } = useAppLayoutContext();
  const { subscribe } = useSubscription<{ id: string }, Manifest>({
    name: 'ShipmentDetails',
    toSendHeartbeat: true,
  });

  const dismissNotification = useCallback(() => {
    setNotificationId((previousId) => {
      if (previousId) {
        dismissNotifications(previousId);
      }

      return undefined;
    });
  }, [dismissNotifications]);

  const handleManifestClick = useCallback(
    (manifestId: string) => {
      navigate(
        generatePath(ROUTE_SHIPMENT_MANIFEST_DETAILS, {
          shipmentId: id ??'',
          id: manifestId,
        }),
      );
    },
    [id, navigate],
  );

  const handleNewManifest = useCallback(
    (data?: Shipment) => {
      if (data) {
        dismissNotification();

        const manifest: Manifest = {
          createdAt: new Date(),
          shipmentId: id ??'',
          status: 'Processing',
          items: data.items,
          containers: data.containers,
        };
        setIsRequesting(true);
        const notificationId = uuidv4();
        createManifest(manifest, {
          onSuccess: (manifestId: string) => {
            setIsRequesting(false);
            addNotification({
              id: notificationId,
              type: 'info',
              header: `Request ${manifestId} submitted`,
              content: 'Packing manifest computation is in progress. It may take a few minutes',
              dismissible: true,
            });
            setNotificationId(notificationId);
            subscribe(
              subscribeManifestUpdateForShipmentRequest(id ?? '', manifestId, (newData: Manifest) => {
                console.log('received Manifest Update', newData);
                const newNotificationId = uuidv4();
                if (newData.status === 'Complete') {
                  dismissNotification();
                  addNotification({
                    id: newNotificationId,
                    type: 'success',
                    header: 'Success',
                    content: 'A new packing manifest is generated successfully.',
                    dismissible: true,
                    buttonText: 'View Details',
                    onButtonClick: () => {
                      navigate(
                        generatePath(ROUTE_SHIPMENT_MANIFEST_DETAILS, {
                          shipmentId: id ?? '',
                          id: manifestId,
                        }),
                      );
                    },
                  });
                  setNotificationId(newNotificationId);
                } else if (newData.status === 'Error') {
                  dismissNotification();
                  addNotification({
                    id: newNotificationId,
                    type: 'error',
                    header: 'Error',
                    content: `The packing manifest ${manifestId} computation failed`,
                    dismissible: true,
                    buttonText: 'View Details',
                    onButtonClick: () => {
                      navigate(
                        generatePath(ROUTE_SHIPMENT_MANIFEST_DETAILS, {
                          shipmentId: id ?? '',
                          id: manifestId,
                        }),
                      );
                    },
                  });
                  setNotificationId(newNotificationId);
                }
              }),
            );
          },
          onError: (error) => {
            setIsRequesting(false);
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
      }
    },
    [createManifest, addNotification, dismissNotification, id, subscribe, navigate],
  );

  const mainAction = useMemo(() => {
    return {
      label: 'Compute Packing Manifest',
      loading: isRequesting,
      onClick: handleNewManifest,
    };
  }, [handleNewManifest, isRequesting]);

  return (
    <GenericDetails
      getRequest={getShipmentRequest}
      DetailsComponent={ShipmentDetailsComponent}
      deleteRequest={deleteShipmentRequest}
      mainAction={mainAction}
      routeUpdate={ROUTE_SHIPMENT_UPDATE}
    >
      {(data) => (
        <Stack>
          <ManifestListContainer shipmentId={data.Id || ''} onClick={handleManifestClick} />
          <ShipmentContainerList data={data.containers || []} containerTypes={containerTypes || []} />
          <ShipmentItemList data={data.items || []} itemTypes={itemTypes || []} />
        </Stack>
      )}
    </GenericDetails>
  );
};

export default ShipmentDetails;
