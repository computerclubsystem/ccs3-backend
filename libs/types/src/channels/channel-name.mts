import { ValueOf } from "src/declarations.mjs";

export const ChannelName = {
    shared: `ccs3/shared`,
    devices: `ccs3/devices`,
    operators: `ccs3/operators`,
} as const;
export type ChannelName = ValueOf<typeof ChannelName>;
