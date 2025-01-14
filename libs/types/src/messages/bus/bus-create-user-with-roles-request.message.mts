import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';
import { User } from 'src/entities/user.mjs';

export interface BusCreateUserWithRolesRequestMessageBody {
    user: User;
    passwordHash: string;
    roleIds: number[];
}

export interface BusCreateUserWithRolesRequestMessage extends Message<BusCreateUserWithRolesRequestMessageBody> {
}

export function createBusCreateUserWithRolesRequestMessage(): BusCreateUserWithRolesRequestMessage {
    const msg: BusCreateUserWithRolesRequestMessage = {
        header: { type: MessageType.busCreateUserWithRolesRequest },
        body: {} as BusCreateUserWithRolesRequestMessageBody,
    };
    return msg;
};