import { Permission } from 'src/entities/permission.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';

export interface OperatorGetAllPermissionsReplyMessageBody {
    permissions: Permission[];
}

export interface OperatorGetAllPermissionsReplyMessage extends OperatorReplyMessage<OperatorGetAllPermissionsReplyMessageBody> {
}

export function createOperatorGetAllPermissionsReplyMessage(): OperatorGetAllPermissionsReplyMessage {
    const msg: OperatorGetAllPermissionsReplyMessage = {
        header: { type: OperatorReplyMessageType.getAllPermissionsReply },
        body: {} as OperatorGetAllPermissionsReplyMessageBody,
    };
    return msg;
};
