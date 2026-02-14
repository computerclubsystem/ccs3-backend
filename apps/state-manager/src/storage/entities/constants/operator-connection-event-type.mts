import { ValueOf } from "@computerclubsystem/types/declarations.mjs";

export const OperatorConnectionEventType = {
    passwordAuthSuccess: 1,
    disconnected: 2,
    connectionError: 3,
    idleTimeout: 4,
    tokenAuthSuccess: 5,
    usedExpiredToken: 6,
} as const;
export type OperatorConnectionEventType = ValueOf<typeof OperatorConnectionEventType>;
