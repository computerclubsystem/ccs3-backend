import { DeviceToServerNotificationMessage } from './declarations/device-to-server-notification-message.mjs';

export interface DeviceToServerPingNotificationMessageBody {
}

export interface DeviceToServerPingNotificationMessage extends DeviceToServerNotificationMessage<DeviceToServerPingNotificationMessageBody> {
}