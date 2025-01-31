import { DeviceToServerNotificationMessageType } from './device-to-server-notification-message-type.mjs';

export interface DeviceToServerNotificationMessageHeader {
    type: DeviceToServerNotificationMessageType;
}