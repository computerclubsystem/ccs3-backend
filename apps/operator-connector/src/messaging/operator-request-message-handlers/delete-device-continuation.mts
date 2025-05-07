import { createOperatorDeleteDeviceContinuationReplyMessage, OperatorDeleteDeviceContinuationRequestMessage } from '@computerclubsystem/types/messages/operators/operator-delete-device-continuation.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { BusDeleteDeviceContinuationReplyMessageBody, createBusDeleteDeviceContinuationRequestMessage } from '@computerclubsystem/types/messages/bus/bus-delete-device-continuation.messages.mjs';

export class DeleteDeviceContinuationRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorDeleteDeviceContinuationRequestMessage;
        const busRequestMsg = createBusDeleteDeviceContinuationRequestMessage();
        busRequestMsg.body.deviceId = message.body.deviceId;
        this.publishToOperatorsChannelAndWaitForReply<BusDeleteDeviceContinuationReplyMessageBody>(context, busRequestMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorDeleteDeviceContinuationReplyMessage();
                context.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}