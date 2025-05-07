import { createOperatorGetShiftsReplyMessage, OperatorGetShiftsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-shifts.messages.mjs';
import { BusGetShiftsReplyMessageBody, createBusGetShiftsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-shifts.messages.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';

export class GetShiftsRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorGetShiftsRequestMessage;
        const busReqMsg = createBusGetShiftsRequestMessage();
        busReqMsg.body.fromDate = message.body.fromDate;
        busReqMsg.body.toDate = message.body.toDate;
        busReqMsg.body.userId = message.body.userId;
        this.publishToOperatorsChannelAndWaitForReply<BusGetShiftsReplyMessageBody>(context, busReqMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetShiftsReplyMessage();
                operatorReplyMsg.body.shifts = busReplyMsg.body.shifts;
                operatorReplyMsg.body.shiftsSummary = busReplyMsg.body.shiftsSummary;
                context.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}