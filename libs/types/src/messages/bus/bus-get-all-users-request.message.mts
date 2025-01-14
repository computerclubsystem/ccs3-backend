import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusGetAllUsersRequestMessageBody {
}

export interface BusGetAllUsersRequestMessage extends Message<BusGetAllUsersRequestMessageBody> {
}

export function createBusGetAllUsersRequestMessage(): BusGetAllUsersRequestMessage {
    const msg: BusGetAllUsersRequestMessage = {
        header: { type: MessageType.busGetAllUsersRequest },
        body: {} as BusGetAllUsersRequestMessageBody,
    };
    return msg;
};