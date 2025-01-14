import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusGetUserWithRolesRequestMessageBody {
    userId: number;
}

export interface BusGetUserWithRolesRequestMessage extends Message<BusGetUserWithRolesRequestMessageBody> {
}

export function createBusGetUserWithRolesRequestMessage(): BusGetUserWithRolesRequestMessage {
    const msg: BusGetUserWithRolesRequestMessage = {
        header: { type: MessageType.busGetUserWithRolesRequest },
        body: {} as BusGetUserWithRolesRequestMessageBody,
    };
    return msg;
};