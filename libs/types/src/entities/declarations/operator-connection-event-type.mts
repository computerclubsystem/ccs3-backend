import { ValueOf } from "src/declarations.mjs";

export const OperatorConnectionEventType = {
    passwordAuthSuccess: 1,
    disconnected: 2,
    connectionError: 3,
    idleTimeout: 4,
    tokenAuthSuccess: 5,
    usedExpiredToken: 6,
    tokenRefreshed: 7,
    refreshTokenFailed: 8,
} as const;
export type OperatorConnectionEventType = ValueOf<typeof OperatorConnectionEventType>;
