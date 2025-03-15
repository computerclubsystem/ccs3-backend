import { Permission } from 'src/entities/permission.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';

export type OperatorGetAllPermissionsRequestMessageBody = object;

export type OperatorGetAllPermissionsRequestMessage = OperatorRequestMessage<OperatorGetAllPermissionsRequestMessageBody>;


export interface OperatorGetAllPermissionsReplyMessageBody {
    permissions: Permission[];
}

export type OperatorGetAllPermissionsReplyMessage = OperatorReplyMessage<OperatorGetAllPermissionsReplyMessageBody>;

export function createOperatorGetAllPermissionsReplyMessage(): OperatorGetAllPermissionsReplyMessage {
    const msg: OperatorGetAllPermissionsReplyMessage = {
        header: { type: OperatorReplyMessageType.getAllPermissionsReply },
        body: {} as OperatorGetAllPermissionsReplyMessageBody,
    };
    return msg;
};

