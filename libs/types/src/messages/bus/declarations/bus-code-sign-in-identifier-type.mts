import { ValueOf } from "src/declarations.mjs";

export const BusCodeSignInIdentifierType = {
    user: 'user',
    customerCard: 'customer-card',
} as const;
export type BusCodeSignInIdentifierType = ValueOf<typeof BusCodeSignInIdentifierType>;
