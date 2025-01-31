import { ServerToDeviceNotificationMessageType } from './server-to-device-notification-message-type.mjs';

export interface ServerToDeviceNotificationMessageHeader {
    type: ServerToDeviceNotificationMessageType;
}
