import { createOperatorGetCurrentShiftStatusReplyMessage, OperatorGetCurrentShiftStatusRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-current-shift-status.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { BusGetCurrentShiftStatusReplyMessageBody, createBusGetCurrentShiftStatusRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-current-shift-status.messages.mjs';

export class GetCurrentShiftStatusRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorGetCurrentShiftStatusRequestMessage;
        const busReqMsg = createBusGetCurrentShiftStatusRequestMessage();
        this.publishToOperatorsChannelAndWaitForReply<BusGetCurrentShiftStatusReplyMessageBody>(context, busReqMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetCurrentShiftStatusReplyMessage();
                operatorReplyMsg.body.shiftStatus = busReplyMsg.body.shiftStatus;
                context.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}