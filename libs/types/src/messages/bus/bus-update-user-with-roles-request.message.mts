import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';
import { User } from 'src/entities/user.mjs';

export interface BusUpdateUserWithRolesRequestMessageBody {
    user: User;
    passwordHash?: string;
    roleIds: number[];
}

export interface BusUpdateUserWithRolesRequestMessage extends Message<BusUpdateUserWithRolesRequestMessageBody> {
}

export function createBusUpdateUserWithRolesRequestMessage(): BusUpdateUserWithRolesRequestMessage {
    const msg: BusUpdateUserWithRolesRequestMessage = {
        header: { type: MessageType.busUpdateUserWithRolesRequest },
        body: {} as BusUpdateUserWithRolesRequestMessageBody,
    };
    return msg;
};