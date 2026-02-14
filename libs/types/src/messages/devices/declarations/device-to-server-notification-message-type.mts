import { ValueOf } from "src/declarations.mjs";

export const DeviceToServerNotificationMessageType = {
    ping: 'ping-request',
} as const;
export type DeviceToServerNotificationMessageType = ValueOf<typeof DeviceToServerNotificationMessageType>;