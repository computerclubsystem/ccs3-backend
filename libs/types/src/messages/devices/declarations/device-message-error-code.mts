import { ValueOf } from "src/declarations.mjs";

export const DeviceMessageErrorCode = {
    qrCodeSignInFeatureUrlIsNotCorrect: 'qrcode-sign-in-feature-url-is-not-correct',
    qrCodeSignFeatureIsNotEnabled: 'qrcode-sign-in-feature-is-not-enabled',
    internalServerError: 'internal-server-error',
} as const;
export type DeviceMessageErrorCode = ValueOf<typeof DeviceMessageErrorCode>;