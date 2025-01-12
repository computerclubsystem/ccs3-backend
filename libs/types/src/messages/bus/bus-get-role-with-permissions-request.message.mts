import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusGetRoleWithPermissionsRequestMessageBody {
    roleId: number;
}

export interface BusGetRoleWithPermissionsRequestMessage extends Message<BusGetRoleWithPermissionsRequestMessageBody> {
}

export function createBusGetRoleWithPermissionsRequestMessage(): BusGetRoleWithPermissionsRequestMessage {
    const msg: BusGetRoleWithPermissionsRequestMessage = {
        header: { type: MessageType.busGetRoleWithPermissionsRequest },
        body: {} as BusGetRoleWithPermissionsRequestMessageBody,
    };
    return msg;
};