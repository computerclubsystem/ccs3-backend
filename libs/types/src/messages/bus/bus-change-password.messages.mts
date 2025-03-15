import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusChangePasswordRequestMessageBody {
    userId: number;
    currentPasswordHash: string;
    newPasswordHash: string;
}

export type BusChangePasswordRequestMessage = Message<BusChangePasswordRequestMessageBody>;

export function createBusChangePasswordRequestMessage(): BusChangePasswordRequestMessage {
    const msg: BusChangePasswordRequestMessage = {
        header: { type: MessageType.busChangePasswordRequest },
        body: {} as BusChangePasswordRequestMessageBody,
    };
    return msg;
}


export type BusChangePasswordReplyMessageBody = object;

export type BusChangePasswordReplyMessage = Message<BusChangePasswordReplyMessageBody>;

export function createBusChangePasswordReplyMessage(): BusChangePasswordReplyMessage {
    const msg: BusChangePasswordReplyMessage = {
        header: { type: MessageType.busChangePasswordReply },
        body: {},
    };
    return msg;
}