import { Permission } from 'src/entities/permission.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export type BusGetAllPermissionsRequestMessageBody = object;

export type BusGetAllPermissionsRequestMessage = Message<BusGetAllPermissionsRequestMessageBody>;

export function createBusGetAllPermissionsRequestMessage(): BusGetAllPermissionsRequestMessage {
    const msg: BusGetAllPermissionsRequestMessage = {
        header: { type: MessageType.busGetAllPermissionsRequest },
        body: {} as BusGetAllPermissionsRequestMessageBody,
    };
    return msg;
};


export interface BusGetAllPermissionsReplyMessageBody {
    permissions: Permission[];
}

export type BusGetAllPermissionsReplyMessage = Message<BusGetAllPermissionsReplyMessageBody>;

export function createBusGetAllPermissionsReplyMessage(): BusGetAllPermissionsReplyMessage {
    const msg: BusGetAllPermissionsReplyMessage = {
        header: { type: MessageType.busGetAllPermissionsReply },
        body: {} as BusGetAllPermissionsReplyMessageBody,
    };
    return msg;
};
