import { DeviceConnectionEventType } from './constants/device-connection-event-type.mjs';

export interface IDeviceConnectionEvent {
    id: number;
    device_id: number;
    ip_address?: string;
    note?: string;
    type: DeviceConnectionEventType;
    timestamp: string;
}
