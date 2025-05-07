import { createOperatorGetAllPermissionsReplyMessage, OperatorGetAllPermissionsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-permissions.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { BusGetAllPermissionsReplyMessageBody, createBusGetAllPermissionsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-permissions.messages.mjs';

export class GetAllPermissionsRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorGetAllPermissionsRequestMessage;
        const requestMsg = createBusGetAllPermissionsRequestMessage();
        this.publishToOperatorsChannelAndWaitForReply<BusGetAllPermissionsReplyMessageBody>(context, requestMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetAllPermissionsReplyMessage();
                operatorReplyMsg.body.permissions = busReplyMsg.body.permissions;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = context.errorReplyHelper.cantGetAllPermissionsErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}