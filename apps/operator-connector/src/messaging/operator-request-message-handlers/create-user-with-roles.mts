import { createOperatorCreateUserWithRolesReplyMessage, OperatorCreateUserWithRolesRequestMessage } from '@computerclubsystem/types/messages/operators/operator-create-user-with-roles.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { BusCreateUserWithRolesReplyMessageBody, createBusCreateUserWithRolesRequestMessage } from '@computerclubsystem/types/messages/bus/bus-create-user-with-roles.messages.mjs';

export class CreateUserWithRolesRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorCreateUserWithRolesRequestMessage;
        const busReqMsg = createBusCreateUserWithRolesRequestMessage();
        busReqMsg.body.user = message.body.user;
        busReqMsg.body.roleIds = message.body.roleIds;
        busReqMsg.body.passwordHash = message.body.passwordHash;
        this.publishToOperatorsChannelAndWaitForReply<BusCreateUserWithRolesReplyMessageBody>(context, busReqMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorCreateUserWithRolesReplyMessage();
                operatorReplyMsg.body.user = busReplyMsg.body.user;
                operatorReplyMsg.body.roleIds = busReplyMsg.body.roleIds;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = context.errorReplyHelper.createUserWithRolesErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}