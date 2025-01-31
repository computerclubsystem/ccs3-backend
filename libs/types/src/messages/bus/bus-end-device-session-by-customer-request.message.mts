import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusEndDeviceSessionByCustomerRequestMessageBody {
    deviceId: number;
}

export interface BusEndDeviceSessionByCustomerRequestMessage extends Message<BusEndDeviceSessionByCustomerRequestMessageBody> {
}

export function createBusEndDeviceSessionByCustomerRequestMessage(): BusEndDeviceSessionByCustomerRequestMessage {
    var msg: BusEndDeviceSessionByCustomerRequestMessage = {
        header: {
            type: MessageType.busEndDeviceSessionByCustomerRequest,
        },
        body: {} as BusEndDeviceSessionByCustomerRequestMessageBody,
    };
    return msg;
}