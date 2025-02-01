import { DeviceToServerRequestMessage } from './declarations/device-to-server-request-message.mjs';

export interface DeviceToServerChangePrepaidTariffPasswordByCustomerRequestMessageBody {
    currentPasswordHash: string;
    newPasswordHash: string;
}

export interface DeviceToServerChangePrepaidTariffPasswordByCustomerRequestMessage extends DeviceToServerRequestMessage<DeviceToServerChangePrepaidTariffPasswordByCustomerRequestMessageBody> {
}