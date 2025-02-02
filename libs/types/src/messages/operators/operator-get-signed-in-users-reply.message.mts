import { SignedInUser } from 'src/entities/signed-in-user.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';

export interface OperatorGetSignedInUsersReplyMessageBody {
    signedInUsers: SignedInUser[];
}

export interface OperatorGetSignedInUsersReplyMessage extends OperatorReplyMessage<OperatorGetSignedInUsersReplyMessageBody> {
}

export function createOperatorGetSignedInUsersReplyMessage(): OperatorGetSignedInUsersReplyMessage {
    const msg: OperatorGetSignedInUsersReplyMessage = {
        header: {
            type: OperatorReplyMessageType.getSigndInUsersReply,
        },
        body: {} as OperatorGetSignedInUsersReplyMessageBody,
    };
    return msg;
}