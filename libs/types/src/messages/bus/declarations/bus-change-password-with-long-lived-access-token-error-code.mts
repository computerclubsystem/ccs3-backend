import { ValueOf } from "src/declarations.mjs";

export const BusChangePasswordWithLongLivedAccessTokenErrorCode = {
    invalidToken: 'invalid-token',
    invalidPassword: 'invalid-password',
    userIsDisabled: 'user-disabled',
    invalidUser: 'invalid-user',
    customerCardIsNotEnabled: 'customer-card-is-not-enabled',
    serverError: 'server-error',
} as const;
export type BusChangePasswordWithLongLivedAccessTokenErrorCode = ValueOf<typeof BusChangePasswordWithLongLivedAccessTokenErrorCode>;