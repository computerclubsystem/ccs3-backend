import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Permission } from 'src/entities/permission.mjs';

export interface BusGetAllPermissionsReplyMessageBody {
    permissions: Permission[];
}

export interface BusGetAllPermissionsReplyMessage extends Message<BusGetAllPermissionsReplyMessageBody> {
}

export function createBusGetAllPermissionsReplyMessage(): BusGetAllPermissionsReplyMessage {
    const msg: BusGetAllPermissionsReplyMessage = {
        header: { type: MessageType.busGetAllPermissionsReply },
        body: {} as BusGetAllPermissionsReplyMessageBody,
    };
    return msg;
};
