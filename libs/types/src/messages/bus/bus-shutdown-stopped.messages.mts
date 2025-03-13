import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export type BusShutdownStoppedRequestMessageBody = object;

export type BusShutdownStoppedRequestMessage = Message<BusShutdownStoppedRequestMessageBody>;

export function createBusShutdownStoppedRequestMessage(): BusShutdownStoppedRequestMessage {
    const msg: BusShutdownStoppedRequestMessage = {
        header: { type: MessageType.busShutdownStoppedRequest },
        body: {},
    };
    return msg;
}


export interface BusShutdownStoppedReplyMessageBody {
    targetsCount: number;
}

export type BusShutdownStoppedReplyMessage = Message<BusShutdownStoppedReplyMessageBody>;

export function createBusShutdownStoppedReplyMessage(): BusShutdownStoppedReplyMessage {
    const msg: BusShutdownStoppedReplyMessage = {
        header: { type: MessageType.busShutdownStoppedReply },
        body: {} as BusShutdownStoppedReplyMessageBody,
    };
    return msg;
}