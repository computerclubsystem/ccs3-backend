import { createOperatorGetAllUsersReplyMessage, OperatorGetAllUsersRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-users.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { BusGetAllUsersReplyMessageBody, createBusGetAllUsersRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-users.messages.mjs';

export class GetAllUsersRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorGetAllUsersRequestMessage;
        const requestMsg = createBusGetAllUsersRequestMessage();
        this.publishToOperatorsChannelAndWaitForReply<BusGetAllUsersReplyMessageBody>(context, requestMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetAllUsersReplyMessage();
                operatorReplyMsg.body.users = busReplyMsg.body.users;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = context.errorReplyHelper.cantGetAllUsersErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}