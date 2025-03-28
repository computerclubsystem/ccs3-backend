import { DeviceToServerNotificationMessage } from './declarations/device-to-server-notification-message.mjs';

export type DeviceToServerPingNotificationMessageBody = object;

export type DeviceToServerPingNotificationMessage = DeviceToServerNotificationMessage<DeviceToServerPingNotificationMessageBody>;