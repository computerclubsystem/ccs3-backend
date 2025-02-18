import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export type BusChangePasswordReplyMessageBody = object;

export type BusChangePasswordReplyMessage = Message<BusChangePasswordReplyMessageBody>;

export function createBusChangePasswordReplyMessage(): BusChangePasswordReplyMessage {
    const msg: BusChangePasswordReplyMessage = {
        header: { type: MessageType.busChangePasswordReply },
        body: {},
    };
    return msg;
}