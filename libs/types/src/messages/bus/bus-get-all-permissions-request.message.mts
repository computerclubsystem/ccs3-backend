import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusGetAllPermissionsRequestMessageBody {
}

export interface BusGetAllPermissionsRequestMessage extends Message<BusGetAllPermissionsRequestMessageBody> {
}

export function createBusGetAllPermissionsRequestMessage(): BusGetAllPermissionsRequestMessage {
    const msg: BusGetAllPermissionsRequestMessage = {
        header: { type: MessageType.busGetAllPermissionsRequest },
        body: {} as BusGetAllPermissionsRequestMessageBody,
    };
    return msg;
};