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
type MessageHandler<TData extends unknown> = (data: EventData<TData>) => void;

export interface EventData<TData extends unknown> {
  type: string;
  data: TData;
}

export interface EventHandlersMapping<TData extends unknown> {
  OPEN?: (socket: WebSocket, event: Event) => void;
  MESSAGE?: MessageHandler<TData>;
}

export default class WebSocketClient<TData extends unknown> {
  readonly toSendHeartbeat: boolean;
  private eventHandlersMapping: EventHandlersMapping<TData>;
  private socket: WebSocket;
  private serverUrl: string;
  private closeEventHandler?: (event: Event) => void;
  private name: string;
  private heartbeatTimer: any;
  private messageHandlers: MessageHandler<TData>[];

  constructor(
    name: string,
    serverUrl: string,
    toSendHeartbeat = false,
    eventHandlersMapping: EventHandlersMapping<TData> = {},
  ) {
    this.eventHandlersMapping = eventHandlersMapping;
    this.name = name;
    this.serverUrl = serverUrl;
    this.toSendHeartbeat = toSendHeartbeat;
    this.messageHandlers = [];
    if(eventHandlersMapping.MESSAGE) {
      this.messageHandlers.push(eventHandlersMapping.MESSAGE);
    }
    this.socket = this.setupWebSocketConnection();
  }

  sendHeartbeat = () => {
    this.heartbeatTimer = setTimeout(() => {
      this.socket.send(JSON.stringify({ action: 'heartbeat' }));
      this.sendHeartbeat();
    }, 30000);
  };

  private setupWebSocketConnection = () => {
    console.log('Setting up WebSocket ', this.name);
    const socket = new WebSocket(this.serverUrl);

    const openHandler = (event: Event) => {
      console.log(`WebSocket ${this.name} Connected`)
      if (this.toSendHeartbeat) {
        this.sendHeartbeat();
      }
      
      if (this.eventHandlersMapping.OPEN) {
        this.eventHandlersMapping.OPEN(this.socket, event);
      }
    };
    socket.addEventListener('open', openHandler);

    const messageHandler = (event: MessageEvent) => {
      const eventData = JSON.parse(event.data) as EventData<TData>;
      if (this.toSendHeartbeat && eventData.type === 'heartbeat') {
        console.log(`Received heartbeat from WS Server for ${this.name}`);
      } else if (this.messageHandlers.length > 0) {
        this.messageHandlers.forEach(handler => handler(eventData));
      }
    };
    socket.addEventListener('message', messageHandler);

    this.closeEventHandler = (event: Event) => {
      console.log(`WebSocket ${this.name} Closed: `, event);
      if (this.heartbeatTimer) {
        clearTimeout(this.heartbeatTimer);
        this.heartbeatTimer = undefined;
      }
      this.setupWebSocketConnection();
    };

    socket.addEventListener('close', this.closeEventHandler);

    socket.addEventListener('error', (event: Event) => {
      console.log(`WebSocket ${this.name} Error: `, event);
    });

    return socket;
  };

  onMessage = (eventHandler: MessageHandler<TData>) => {
    this.messageHandlers.push(eventHandler);
    this.socket.addEventListener('message', (event: MessageEvent) => {
      const eventData = JSON.parse(event.data);
      eventHandler(eventData);
    });
  }

  send = (data: unknown) => {
    this.socket.send(JSON.stringify(data));
  }

  close() {
    if (this.closeEventHandler) {
      this.socket.removeEventListener('close', this.closeEventHandler);
    }

    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
    this.socket.close();
    console.log(`WebSocket ${this.name} Closed`);
  }
}
