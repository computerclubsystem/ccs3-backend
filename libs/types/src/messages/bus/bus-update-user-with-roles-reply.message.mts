import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { User } from 'src/entities/user.mjs';

export interface BusUpdateUserWithRolesReplyMessageBody {
    user?: User;
    passwordHash?: string;
    roleIds?: number[];
}

export interface BusUpdateUserWithRolesReplyMessage extends Message<BusUpdateUserWithRolesReplyMessageBody> {
}

export function createBusUpdateUserWithRolesReplyMessage(): BusUpdateUserWithRolesReplyMessage {
    const msg: BusUpdateUserWithRolesReplyMessage = {
        header: { type: MessageType.busUpdateUserWithRolesReply },
        body: {} as BusUpdateUserWithRolesReplyMessageBody,
    };
    return msg;
};
