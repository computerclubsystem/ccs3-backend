import { ValueOf } from "@computerclubsystem/types/declarations.mjs";

export const DeviceConnectionEventType = {
    connected: 1,
    disconnected: 2,
    connectionError: 3,
    idleTimeout: 4,
} as const;
export type DeviceConnectionEventType = ValueOf<typeof DeviceConnectionEventType>;
