import { DeviceToServerRequestMessage } from './declarations/device-to-server-request-message.mjs';

export interface DeviceToServerStartOnPrepaidTariffRequestMessageBody {
    tariffId: number;
    passwordHash: string;
}

export type DeviceToServerStartOnPrepaidTariffRequestMessage = DeviceToServerRequestMessage<DeviceToServerStartOnPrepaidTariffRequestMessageBody>;
