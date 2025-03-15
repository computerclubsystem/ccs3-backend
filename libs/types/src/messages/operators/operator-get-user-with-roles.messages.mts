import { User } from 'src/entities/user.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';

export interface OperatorGetUserWithRolesRequestMessageBody {
    userId: number;
}

export type OperatorGetUserWithRolesRequestMessage = OperatorRequestMessage<OperatorGetUserWithRolesRequestMessageBody>;


export interface OperatorGetUserWithRolesReplyMessageBody {
    user?: User;
    roleIds?: number[];
}

export type OperatorGetUserWithRolesReplyMessage = OperatorReplyMessage<OperatorGetUserWithRolesReplyMessageBody>;

export function createOperatorGetUserWithRolesReplyMessage(): OperatorGetUserWithRolesReplyMessage {
    const msg: OperatorGetUserWithRolesReplyMessage = {
        header: { type: OperatorReplyMessageType.getUserWithRolesReply },
        body: {} as OperatorGetUserWithRolesReplyMessageBody,
    };
    return msg;
};

