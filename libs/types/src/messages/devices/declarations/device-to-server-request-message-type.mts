export enum DeviceToServerRequestMessageType {
    startOnPrepaidTariff = 'start-on-prepaid-tariff-request',
    endDeviceSessionByCustomer = 'end-device-session-by-customer-request',
    changePrepaidTariffPasswordByCustomer = 'change-prepaid-tariff-password-by-customer-request',
    createSignInCode = 'create-sign-in-code-request',
}
