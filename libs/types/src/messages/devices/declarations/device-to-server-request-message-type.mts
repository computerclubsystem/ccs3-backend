import { ValueOf } from "src/declarations.mjs";

export const DeviceToServerRequestMessageType = {
    startOnPrepaidTariff: 'start-on-prepaid-tariff-request',
    endDeviceSessionByCustomer: 'end-device-session-by-customer-request',
    changePrepaidTariffPasswordByCustomer: 'change-prepaid-tariff-password-by-customer-request',
    createSignInCode: 'create-sign-in-code-request',
} as const;
export type DeviceToServerRequestMessageType = ValueOf<typeof DeviceToServerRequestMessageType>;
