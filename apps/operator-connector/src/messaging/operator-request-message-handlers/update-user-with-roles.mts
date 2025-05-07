import { createOperatorUpdateUserWithRolesReplyMessage, OperatorUpdateUserWithRolesRequestMessage } from '@computerclubsystem/types/messages/operators/operator-update-user-with-roles.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { BusUpdateUserWithRolesReplyMessageBody, createBusUpdateUserWithRolesRequestMessage } from '@computerclubsystem/types/messages/bus/bus-update-user-with-roles.messages.mjs';

export class UpdateUserWithRolesRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorUpdateUserWithRolesRequestMessage;
        const requestMsg = createBusUpdateUserWithRolesRequestMessage();
        requestMsg.body.user = message.body.user;
        requestMsg.body.roleIds = message.body.roleIds;
        requestMsg.body.passwordHash = message.body.passwordHash;
        this.publishToOperatorsChannelAndWaitForReply<BusUpdateUserWithRolesReplyMessageBody>(context, requestMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorUpdateUserWithRolesReplyMessage();
                operatorReplyMsg.body.user = busReplyMsg.body.user;
                operatorReplyMsg.body.roleIds = busReplyMsg.body.roleIds;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = context.errorReplyHelper.updateUserWithRolesErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}