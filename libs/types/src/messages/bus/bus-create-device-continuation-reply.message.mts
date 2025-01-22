import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { DeviceContinuation } from 'src/entities/device-continuation.mjs';

export interface BusCreateDeviceContinuationReplyMessageBody {
    deviceContinuation: DeviceContinuation;
}

export interface BusCreateDeviceContinuationReplyMessage extends Message<BusCreateDeviceContinuationReplyMessageBody> {
}

export function createBusCreateDeviceContinuationReplyMessage(): BusCreateDeviceContinuationReplyMessage {
    const msg: BusCreateDeviceContinuationReplyMessage = {
        header: { type: MessageType.busCreateDeviceContinuationReply },
        body: {} as BusCreateDeviceContinuationReplyMessageBody,
    };
    return msg;
};
