import { Role } from 'src/entities/role.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';

export type OperatorGetAllRolesRequestMessageBody = object;

export type OperatorGetAllRolesRequestMessage = OperatorRequestMessage<OperatorGetAllRolesRequestMessageBody>;


export interface OperatorGetAllRolesReplyMessageBody {
    roles: Role[];
}

export type OperatorGetAllRolesReplyMessage = OperatorReplyMessage<OperatorGetAllRolesReplyMessageBody>;

export function createOperatorGetAllRolesReplyMessage(): OperatorGetAllRolesReplyMessage {
    const msg: OperatorGetAllRolesReplyMessage = {
        header: { type: OperatorReplyMessageType.getAllRolesReply },
        body: {} as OperatorGetAllRolesReplyMessageBody,
    };
    return msg;
};
