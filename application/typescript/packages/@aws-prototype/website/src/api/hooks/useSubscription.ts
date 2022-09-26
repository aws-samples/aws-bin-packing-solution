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
import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from 'react-query';
import { Auth } from 'aws-amplify';
import getConfig from 'utils/getConfig';
import WebSocketClient, { EventData } from 'utils/WebSocketClient';
import { WebSocketRequest, Subscription } from '../types';

const useSubscription = <TPayload extends unknown, TData extends unknown>(request: WebSocketRequest) => {
  const queryClient = useQueryClient();
  const webSocketClient = useRef<WebSocketClient<TData>>();
  const subscribe = useCallback(async (subcription: Subscription<TPayload, TData>) => {
      const onMessage = (data: EventData<TData>) => {
        if (data.type === subcription.type) {
          subcription.queryKeys?.forEach((queryKey) => queryClient.invalidateQueries(queryKey));
          subcription.onDataReceived?.(data.data as TData);
        }
      };

      if (!webSocketClient.current) {
        const token = (await Auth.currentSession()).getIdToken().getJwtToken();
        const onOpen = (socket: WebSocket) => {
          socket.send(
            JSON.stringify({
              action: 'subscribe',
              type: subcription.type,
              payload: subcription.payload,
            }),
          );
        };
        webSocketClient.current = new WebSocketClient<TData>(
          request.name,
          `${getConfig().webSocketUrl}?token=${token}`,
          request.toSendHeartbeat,
          {
            OPEN: onOpen,
            MESSAGE: onMessage,
          },
        );
      } else {
        webSocketClient.current.send({
          action: 'subscribe',
          type: subcription.type,
          payload: subcription.payload,
        });

        webSocketClient.current.onMessage(onMessage);
      }
    },
    [queryClient, request],
  );

  useEffect(() => {
    return () => {
      if (webSocketClient.current) {
        webSocketClient.current.close();
      }
    };
  }, []);

  return {
    subscribe,
  };
};

export default useSubscription;
