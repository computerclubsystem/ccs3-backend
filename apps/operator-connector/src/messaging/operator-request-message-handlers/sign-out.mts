import { createOperatorSignOutReplyMessage, OperatorSignOutRequestMessage } from '@computerclubsystem/types/messages/operators/operator-sign-out.messages.mjs';
import { PermissionName } from '@computerclubsystem/types/entities/declarations/permission-name.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';

export class SignOutRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorSignOutRequestMessage;
        context.clientData.isAuthenticated = false;
        context.clientData.permissions = new Set<PermissionName>();
        const token = message.header.token!;
        if (this.isWhiteSpace(token)) {
            return;
        }
        const cachedTokenValue = await context.cacheHelper.getAuthTokenValue(token);
        if (!cachedTokenValue) {
            return;
        }
        await context.cacheHelper.deleteAuthTokenKey(cachedTokenValue.token);
        await context.cacheHelper.deleteUserAuthDataKey(cachedTokenValue.userId, cachedTokenValue.roundtripData.connectionInstanceId);
        const replyMsg = createOperatorSignOutReplyMessage();
        // Received and sent is the opposite for the client and the server
        // Recevied for the client are sent by the server
        replyMsg.body.receivedMessagesCount = context.clientData.sentMessagesCount;
        replyMsg.body.sentMessagesCount = context.clientData.receivedMessagesCount;
        replyMsg.body.sentPingMessagesCount = context.clientData.receivedPingMessagesCount;
        replyMsg.body.sessionStart = context.clientData.connectedAt;
        replyMsg.body.sessionEnd = this.getNowAsNumber();
        this.sendReplyMessageToOperator(context, replyMsg, message);
    }
}