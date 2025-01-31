import { ServerToDeviceNotificationMessageHeader } from './server-to-device-notification-message-header.mjs';

export interface ServerToDeviceNotificationMessage<TBody> {
    header: ServerToDeviceNotificationMessageHeader;
    body: TBody;
}
