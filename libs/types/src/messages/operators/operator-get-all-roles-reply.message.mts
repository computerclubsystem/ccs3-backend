import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';
import { Role } from 'src/entities/role.mjs';

export interface OperatorGetAllRolesReplyMessageBody {
    roles: Role[];
}

export interface OperatorGetAllRolesReplyMessage extends OperatorReplyMessage<OperatorGetAllRolesReplyMessageBody> {
}

export function createOperatorGetAllRolesReplyMessage(): OperatorGetAllRolesReplyMessage {
    const msg: OperatorGetAllRolesReplyMessage = {
        header: { type: OperatorReplyMessageType.getAllRolesReply },
        body: {} as OperatorGetAllRolesReplyMessageBody,
    };
    return msg;
};
