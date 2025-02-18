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