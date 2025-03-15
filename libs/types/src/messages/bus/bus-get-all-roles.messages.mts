import { Role } from 'src/entities/role.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export type BusGetAllRolesRequestMessageBody = object;

export type BusGetAllRolesRequestMessage = Message<BusGetAllRolesRequestMessageBody>;

export function createBusGetAllRolesRequestMessage(): BusGetAllRolesRequestMessage {
    const msg: BusGetAllRolesRequestMessage = {
        header: { type: MessageType.busGetAllRolesRequest },
        body: {} as BusGetAllRolesRequestMessageBody,
    };
    return msg;
};


export interface BusGetAllRolesReplyMessageBody {
    roles: Role[];
}

export type BusGetAllRolesReplyMessage = Message<BusGetAllRolesReplyMessageBody>;

export function createBusGetAllRolesReplyMessage(): BusGetAllRolesReplyMessage {
    const msg: BusGetAllRolesReplyMessage = {
        header: { type: MessageType.busGetAllRolesReply },
        body: {} as BusGetAllRolesReplyMessageBody,
    };
    return msg;
};
