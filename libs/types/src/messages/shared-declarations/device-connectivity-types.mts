import { ValueOf } from "src/declarations.mjs";

export const DeviceConnectivityConnectionEventType = {
    connected: 'connected',
    disconnected: 'disconnected',
    idleTimeout: 'idle-timeout',
    noMessagesReceived: 'no-messages-received',
} as const;
export type DeviceConnectivityConnectionEventType = ValueOf<typeof DeviceConnectivityConnectionEventType>;
 
export interface DeviceConnectivityConnectionEventItem {
    timestamp: number;
    connectionId: number;
    connectionInstanceId: string;
    type: DeviceConnectivityConnectionEventType;
    note?: string | null;
}
