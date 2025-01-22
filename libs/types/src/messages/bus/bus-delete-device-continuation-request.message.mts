import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusDeleteDeviceContinuationRequestMessageBody {
    deviceId: number;
}

export interface BusDeleteDeviceContinuationRequestMessage extends Message<BusDeleteDeviceContinuationRequestMessageBody> {
}

export function createBusDeleteDeviceContinuationRequestMessage(): BusDeleteDeviceContinuationRequestMessage {
    const msg: BusDeleteDeviceContinuationRequestMessage = {
        header: { type: MessageType.busDeleteDeviceContinuationRequest },
        body: {} as BusDeleteDeviceContinuationRequestMessageBody,
    };
    return msg;
};
