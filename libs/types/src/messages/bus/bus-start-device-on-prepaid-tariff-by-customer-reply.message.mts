import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';

export interface BusStartDeviceOnPrepaidTariffByCustomerReplyMessageBody {
    alreadyInUse?: boolean | null;
    notAllowed?: boolean | null;
    passwordDoesNotMatch?: boolean | null;
    noRemainingTime?: boolean | null;
    notAvailableForThisDeviceGroup?: boolean | null;
    remainingSeconds?: number | null;
    success: boolean;
}

export interface BusStartDeviceOnPrepaidTariffByCustomerReplyMessage extends Message<BusStartDeviceOnPrepaidTariffByCustomerReplyMessageBody> {
}

export function createBusStartDeviceOnPrepaidTariffByCustomerReplyMessage(): BusStartDeviceOnPrepaidTariffByCustomerReplyMessage {
    const msg: BusStartDeviceOnPrepaidTariffByCustomerReplyMessage = {
        header: { type: MessageType.busStartDeviceOnPrepaidTariffByCustomerReply },
        body: {} as BusStartDeviceOnPrepaidTariffByCustomerReplyMessageBody,
    };
    return msg;
};
