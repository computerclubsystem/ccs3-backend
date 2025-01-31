import { DeviceToServerRequestMessageHeader } from './device-to-server-request-message-header.mjs';

export interface DeviceToServerRequestMessage<TBody> {
    header: DeviceToServerRequestMessageHeader;
    body: TBody;
}