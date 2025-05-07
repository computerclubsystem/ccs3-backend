import { createOperatorGetAllRolesReplyMessage, OperatorGetAllRolesRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-roles.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { BusGetAllRolesReplyMessageBody, createBusGetAllRolesRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-roles.messages.mjs';

export class GetAllRolesRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorGetAllRolesRequestMessage;
        const requestMsg = createBusGetAllRolesRequestMessage();
        this.publishToOperatorsChannelAndWaitForReply<BusGetAllRolesReplyMessageBody>(context, requestMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetAllRolesReplyMessage();
                operatorReplyMsg.body.roles = busReplyMsg.body.roles;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = context.errorReplyHelper.cantGetAllRolesErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}