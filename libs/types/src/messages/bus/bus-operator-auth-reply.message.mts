import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusOperatorAuthReplyMessageBody {
    success: boolean;
    permissions?: string[];
    // token?: string;
    userId?: number;
}

export interface BusOperatorAuthReplyMessage extends Message<BusOperatorAuthReplyMessageBody> {
}

export function createBusOperatorAuthReplyMessage(): BusOperatorAuthReplyMessage {
    const msg: BusOperatorAuthReplyMessage = {
        header: { type: MessageType.busOperatorAuthReply },
        body: {} as BusOperatorAuthReplyMessageBody,
    };
    return msg;
};