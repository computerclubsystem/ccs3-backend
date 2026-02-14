import { ValueOf } from "src/declarations.mjs";

export const ServerToDeviceReplyMessageType = {
    ping: 'ping-reply',
    startOnPrepaidTariff: 'start-on-prepaid-tariff-reply',
    endDeviceSessionByCustomer: 'end-device-session-by-customer-reply',
    changePrepaidTariffPasswordByCustomer: 'change-prepaid-tariff-password-by-customer-reply',
    createSignInCode: 'create-sign-in-code-reply',
} as const;
export type ServerToDeviceReplyMessageType = ValueOf<typeof ServerToDeviceReplyMessageType>;
