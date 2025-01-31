import { DeviceToServerRequestMessage } from './declarations/device-to-server-request-message.mjs';

export interface DeviceToServerStartOnPrepaidTariffRequestMessageBody {
    tariffId: number;
    passwordHash: string;
}

export interface DeviceToServerStartOnPrepaidTariffRequestMessage extends DeviceToServerRequestMessage<DeviceToServerStartOnPrepaidTariffRequestMessageBody> {
}
