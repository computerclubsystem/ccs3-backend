import { DeviceToServerRequestMessageType } from './device-to-server-request-message-type.mjs';

export interface DeviceToServerRequestMessageHeader {
    type: DeviceToServerRequestMessageType;
    correlationId: string;
}