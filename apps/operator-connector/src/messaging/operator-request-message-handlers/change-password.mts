import { createOperatorChangePasswordReplyMessage, OperatorChangePasswordRequestMessage } from '@computerclubsystem/types/messages/operators/operator-change-password.messages.mjs';
import { BusChangePasswordReplyMessageBody, createBusChangePasswordRequestMessage } from '@computerclubsystem/types/messages/bus/bus-change-password.messages.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';

export class ChangePasswordRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorChangePasswordRequestMessage;
        const busReqMsg = createBusChangePasswordRequestMessage();
        busReqMsg.body.userId = context.clientData.userId!;
        busReqMsg.body.currentPasswordHash = message.body.currentPasswordHash;
        busReqMsg.body.newPasswordHash = message.body.newPasswordHash;
        this.publishToOperatorsChannelAndWaitForReply<BusChangePasswordReplyMessageBody>(context, busReqMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorChangePasswordReplyMessage();
                context.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}