import { createOperatorGetUserWithRolesReplyMessage, OperatorGetUserWithRolesRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-user-with-roles.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { BusGetUserWithRolesReplyMessageBody, createBusGetUserWithRolesRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-user-with-roles.messages.mjs';

export class GetUserWithRolesRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorGetUserWithRolesRequestMessage;
        const requestMsg = createBusGetUserWithRolesRequestMessage();
        requestMsg.body.userId = message.body.userId;
        this.publishToOperatorsChannelAndWaitForReply<BusGetUserWithRolesReplyMessageBody>(context, requestMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetUserWithRolesReplyMessage();
                operatorReplyMsg.body.user = busReplyMsg.body.user;
                operatorReplyMsg.body.roleIds = busReplyMsg.body.roleIds;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = context.errorReplyHelper.getUserWithRolesErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}