import { ValueOf } from "src/declarations.mjs";

export const BusCodeSignInErrorCode = {
    codeNotFound: 'code-not-found',
    codeHasExpired: 'code-has-expired',
    connectionExpired: 'connection-expired',
    invalidToken: 'invalid-token',
    serverError: 'server-error',
} as const;
export type BusCodeSignInErrorCode = ValueOf<typeof BusCodeSignInErrorCode>;