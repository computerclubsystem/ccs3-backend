import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusTransferDeviceRequestMessageBody {
    sourceDeviceId: number;
    targetDeviceId: number;
    userId: number;
    transferNote?: boolean | null;
}

export interface BusTransferDeviceRequestMessage extends Message<BusTransferDeviceRequestMessageBody> {
}

export function createBusTransferDeviceRequestMessage(): BusTransferDeviceRequestMessage {
    const msg: BusTransferDeviceRequestMessage = {
        header: { type: MessageType.busTransferDeviceRequest },
        body: {} as BusTransferDeviceRequestMessageBody,
    };
    return msg;
};