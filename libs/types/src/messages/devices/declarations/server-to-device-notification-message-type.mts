import { ValueOf } from "src/declarations.mjs";

export const ServerToDeviceNotificationMessageType = {
    currentStatus: 'current-status-notification',
    deviceConfiguration: 'device-configuration-notification',
    shutdown: 'shutdown-notification',
    restart: 'restart-notification',
} as const;
export type ServerToDeviceNotificationMessageType = ValueOf<typeof ServerToDeviceNotificationMessageType>;
