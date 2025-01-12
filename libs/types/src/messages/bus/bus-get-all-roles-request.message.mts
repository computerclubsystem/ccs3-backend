import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusGetAllRolesRequestMessageBody {
}

export interface BusGetAllRolesRequestMessage extends Message<BusGetAllRolesRequestMessageBody> {
}

export function createBusGetAllRolesRequestMessage(): BusGetAllRolesRequestMessage {
    const msg: BusGetAllRolesRequestMessage = {
        header: { type: MessageType.busGetAllRolesRequest },
        body: {} as BusGetAllRolesRequestMessageBody,
    };
    return msg;
};