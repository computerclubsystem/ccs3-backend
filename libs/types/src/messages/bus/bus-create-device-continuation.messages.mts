import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';
import { DeviceContinuation } from 'src/entities/device-continuation.mjs';

export interface BusCreateDeviceContinuationRequestMessageBody {
    deviceContinuation: DeviceContinuation;
}

export type BusCreateDeviceContinuationRequestMessage = Message<BusCreateDeviceContinuationRequestMessageBody>;

export function createBusCreateDeviceContinuationRequestMessage(): BusCreateDeviceContinuationRequestMessage {
    const msg: BusCreateDeviceContinuationRequestMessage = {
        header: { type: MessageType.busCreateDeviceContinuationRequest },
        body: {} as BusCreateDeviceContinuationRequestMessageBody,
    };
    return msg;
};


export interface BusCreateDeviceContinuationReplyMessageBody {
    deviceContinuation: DeviceContinuation;
}

export type BusCreateDeviceContinuationReplyMessage = Message<BusCreateDeviceContinuationReplyMessageBody>;

export function createBusCreateDeviceContinuationReplyMessage(): BusCreateDeviceContinuationReplyMessage {
    const msg: BusCreateDeviceContinuationReplyMessage = {
        header: { type: MessageType.busCreateDeviceContinuationReply },
        body: {} as BusCreateDeviceContinuationReplyMessageBody,
    };
    return msg;
};
