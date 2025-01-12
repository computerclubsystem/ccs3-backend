import { Role } from 'src/entities/role.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusCreateRoleWithPermissionsRequestMessageBody {
    role: Role;
    permissionIds: number[];
}

export interface BusCreateRoleWithPermissionsRequestMessage extends Message<BusCreateRoleWithPermissionsRequestMessageBody> {
}

export function createBusCreateRoleWithPermissionsRequestMessage(): BusCreateRoleWithPermissionsRequestMessage {
    const msg: BusCreateRoleWithPermissionsRequestMessage = {
        header: { type: MessageType.busCreateRoleWithPermissionsRequest },
        body: {} as BusCreateRoleWithPermissionsRequestMessageBody,
    };
    return msg;
};