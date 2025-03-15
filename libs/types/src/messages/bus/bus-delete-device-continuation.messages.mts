import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusDeleteDeviceContinuationRequestMessageBody {
    deviceId: number;
}

export type BusDeleteDeviceContinuationRequestMessage = Message<BusDeleteDeviceContinuationRequestMessageBody>;

export function createBusDeleteDeviceContinuationRequestMessage(): BusDeleteDeviceContinuationRequestMessage {
    const msg: BusDeleteDeviceContinuationRequestMessage = {
        header: { type: MessageType.busDeleteDeviceContinuationRequest },
        body: {} as BusDeleteDeviceContinuationRequestMessageBody,
    };
    return msg;
};


export type BusDeleteDeviceContinuationReplyMessageBody = object;

export type BusDeleteDeviceContinuationReplyMessage = Message<BusDeleteDeviceContinuationReplyMessageBody>;

export function createBusDeleteDeviceContinuationReplyMessage(): BusDeleteDeviceContinuationReplyMessage {
    const msg: BusDeleteDeviceContinuationReplyMessage = {
        header: { type: MessageType.busDeleteDeviceContinuationReply },
        body: {} as BusDeleteDeviceContinuationReplyMessageBody,
    };
    return msg;
};
