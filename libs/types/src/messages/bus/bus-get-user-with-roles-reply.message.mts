import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { User } from 'src/entities/user.mjs';

export interface BusGetUserWithRolesReplyMessageBody {
    user?: User;
    roleIds?: number[];
}

export interface BusGetUserWithRolesReplyMessage extends Message<BusGetUserWithRolesReplyMessageBody> {
}

export function createBusGetUserWithRolesReplyMessage(): BusGetUserWithRolesReplyMessage {
    const msg: BusGetUserWithRolesReplyMessage = {
        header: { type: MessageType.busGetUserWithRolesReply },
        body: {} as BusGetUserWithRolesReplyMessageBody,
    };
    return msg;
};
