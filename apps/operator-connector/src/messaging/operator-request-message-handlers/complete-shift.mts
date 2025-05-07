import { createOperatorCompleteShiftReplyMessage, OperatorCompleteShiftRequestMessage } from '@computerclubsystem/types/messages/operators/operator-complete-shift.messages.mjs';
import { BusCompleteShiftReplyMessageBody, createBusCompleteShiftRequestMessage } from '@computerclubsystem/types/messages/bus/bus-complete-shift.messages.mjs';
import { BusGetLastCompletedShiftReplyMessageBody, createBusGetLastCompletedShiftRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-last-completed-shift.messages.mjs';
import { createOperatorSignInInformationNotificationMessage } from '@computerclubsystem/types/messages/operators/operator-sign-in-information-notification.message.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';

export class CompleteShiftRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorCompleteShiftRequestMessage;
        const busReqMsg = createBusCompleteShiftRequestMessage();
        busReqMsg.body.shiftStatus = message.body.shiftStatus;
        busReqMsg.body.note = message.body.note;
        busReqMsg.body.userId = context.clientData.userId!;
        this.publishToOperatorsChannelAndWaitForReply<BusCompleteShiftReplyMessageBody>(context, busReqMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorCompleteShiftReplyMessage();
                operatorReplyMsg.body.shift = busReplyMsg.body.shift;
                context.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
                // TODO: Only send completed shift information
                this.sendSignInInformationNotificationMessage(context);
            });
    }

    private sendSignInInformationNotificationMessage(context: ProcessOperatorRequestMessageContext): void {
        const busGetLastShiftReqMsg = createBusGetLastCompletedShiftRequestMessage();
        this.publishToSharedChannelAndWaitForReply<BusGetLastCompletedShiftReplyMessageBody>(context, busGetLastShiftReqMsg)
            .subscribe(busReplyMsg => {
                const signInInformationNotificationMsg = createOperatorSignInInformationNotificationMessage();
                signInInformationNotificationMsg.body.lastShiftCompletedAt = busReplyMsg.body.shift?.completedAt;
                signInInformationNotificationMsg.body.lastShiftCompletedByUsername = busReplyMsg.body.completedByUsername;
                this.sendNotificationMessageToOperator(context, signInInformationNotificationMsg);
            });
    }
}