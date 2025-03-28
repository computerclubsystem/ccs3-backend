import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusStartDeviceOnPrepaidTariffByCustomerRequestMessageBody {
    deviceId: number;
    tariffId: number;
    passwordHash: string;
}

export type BusStartDeviceOnPrepaidTariffByCustomerRequestMessage = Message<BusStartDeviceOnPrepaidTariffByCustomerRequestMessageBody>;

export function createBusStartDeviceOnPrepaidTariffByCustomerRequestMessage(): BusStartDeviceOnPrepaidTariffByCustomerRequestMessage {
    const msg: BusStartDeviceOnPrepaidTariffByCustomerRequestMessage = {
        header: { type: MessageType.busStartDeviceOnPrepaidTariffByCustomerRequest },
        body: {} as BusStartDeviceOnPrepaidTariffByCustomerRequestMessageBody,
    };
    return msg;
};


export interface BusStartDeviceOnPrepaidTariffByCustomerReplyMessageBody {
    alreadyInUse?: boolean | null;
    notAllowed?: boolean | null;
    passwordDoesNotMatch?: boolean | null;
    noRemainingTime?: boolean | null;
    notAvailableForThisDeviceGroup?: boolean | null;
    remainingSeconds?: number | null;
    success: boolean;
}

export type BusStartDeviceOnPrepaidTariffByCustomerReplyMessage = Message<BusStartDeviceOnPrepaidTariffByCustomerReplyMessageBody>;

export function createBusStartDeviceOnPrepaidTariffByCustomerReplyMessage(): BusStartDeviceOnPrepaidTariffByCustomerReplyMessage {
    const msg: BusStartDeviceOnPrepaidTariffByCustomerReplyMessage = {
        header: { type: MessageType.busStartDeviceOnPrepaidTariffByCustomerReply },
        body: {} as BusStartDeviceOnPrepaidTariffByCustomerReplyMessageBody,
    };
    return msg;
};
