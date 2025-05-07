import { createOperatorGetSignedInUsersReplyMessage, OperatorGetSignedInUsersRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-signed-in-users.messages.mjs';
import { SignedInUser } from '@computerclubsystem/types/entities/signed-in-user.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';

export class GetSignedInUsersRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorGetSignedInUsersRequestMessage;
        const replyMsg = createOperatorGetSignedInUsersReplyMessage();
        const allUsersAuthData = await context.cacheHelper.getAllUsersAuthData();
        const signedInUsers: SignedInUser[] = [];
        for (const authDataItem of allUsersAuthData) {
            signedInUsers.push({
                connectionId: authDataItem.roundtripData.connectionId,
                connectionInstanceId: authDataItem.roundtripData.connectionInstanceId,
                connectedAt: authDataItem.connectedAt,
                tokenExpiresAt: authDataItem.tokenExpiresAt,
                token: authDataItem.token,
                userId: authDataItem.userId,
                username: authDataItem.username,
            });
        }
        replyMsg.body.signedInUsers = signedInUsers;
        this.sendReplyMessageToOperator(context, replyMsg, message);
    }
}