import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusStartDeviceOnPrepaidTariffByCustomerRequestMessageBody {
    deviceId: number;
    tariffId: number;
    passwordHash: string;
}

export interface BusStartDeviceOnPrepaidTariffByCustomerRequestMessage extends Message<BusStartDeviceOnPrepaidTariffByCustomerRequestMessageBody> {
}

export function createBusStartDeviceOnPrepaidTariffByCustomerRequestMessage(): BusStartDeviceOnPrepaidTariffByCustomerRequestMessage {
    const msg: BusStartDeviceOnPrepaidTariffByCustomerRequestMessage = {
        header: { type: MessageType.busStartDeviceOnPrepaidTariffByCustomerRequest },
        body: {} as BusStartDeviceOnPrepaidTariffByCustomerRequestMessageBody,
    };
    return msg;
};