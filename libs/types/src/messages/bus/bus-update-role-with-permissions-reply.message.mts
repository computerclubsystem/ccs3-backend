import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Role } from 'src/entities/role.mjs';

export interface BusUpdateRoleWithPermissionsReplyMessageBody {
    role?: Role;
}

export interface BusUpdateRoleWithPermissionsReplyMessage extends Message<BusUpdateRoleWithPermissionsReplyMessageBody> {
}

export function createBusUpdateRoleWithPermissionsReplyMessage(): BusUpdateRoleWithPermissionsReplyMessage {
    const msg: BusUpdateRoleWithPermissionsReplyMessage = {
        header: { type: MessageType.busUpdateRoleWithPermissionsReply },
        body: {} as BusUpdateRoleWithPermissionsReplyMessageBody,
    };
    return msg;
};
