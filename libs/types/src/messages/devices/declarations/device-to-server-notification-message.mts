import { DeviceToServerNotificationMessageHeader } from './device-to-server-notification-message-header.mjs';

export interface DeviceToServerNotificationMessage<TBody> {
    header: DeviceToServerNotificationMessageHeader;
    body: TBody;
}