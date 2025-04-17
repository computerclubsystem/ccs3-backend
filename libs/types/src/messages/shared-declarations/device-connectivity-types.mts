export enum DeviceConnectivityConnectionEventType {
    connected = 'connected',
    disconnected = 'disconnected',
    idleTimeout = 'idle-timeout',
    noMessagesReceived = 'no-messages-received',
}

export interface DeviceConnectivityConnectionEventItem {
    timestamp: number;
    connectionId: number;
    connectionInstanceId: string;
    type: DeviceConnectivityConnectionEventType;
    note?: string | null;
}
