import { SignedInUser } from 'src/entities/signed-in-user.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';

export type OperatorGetSignedInUsersRequestMessageBody = object;

export type OperatorGetSignedInUsersRequestMessage = OperatorRequestMessage<OperatorGetSignedInUsersRequestMessageBody>;


export interface OperatorGetSignedInUsersReplyMessageBody {
    signedInUsers: SignedInUser[];
}

export type OperatorGetSignedInUsersReplyMessage = OperatorReplyMessage<OperatorGetSignedInUsersReplyMessageBody>;

export function createOperatorGetSignedInUsersReplyMessage(): OperatorGetSignedInUsersReplyMessage {
    const msg: OperatorGetSignedInUsersReplyMessage = {
        header: { type: OperatorReplyMessageType.getSigndInUsersReply, },
        body: {} as OperatorGetSignedInUsersReplyMessageBody,
    };
    return msg;
};