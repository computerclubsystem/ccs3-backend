import { createOperatorCreateDeviceContinuationReplyMessage, OperatorCreateDeviceContinuationRequestMessage } from '@computerclubsystem/types/messages/operators/operator-create-device-continuation.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { BusCreateDeviceContinuationReplyMessageBody, createBusCreateDeviceContinuationRequestMessage } from '@computerclubsystem/types/messages/bus/bus-create-device-continuation.messages.mjs';
import { DeviceContinuation } from '@computerclubsystem/types/entities/device-continuation.mjs';

export class CreateDeviceContinuationRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorCreateDeviceContinuationRequestMessage;
        const busRequestMsg = createBusCreateDeviceContinuationRequestMessage();
        const deviceContinuation: DeviceContinuation = message.body.deviceContinuation;
        deviceContinuation.userId = context.clientData.userId!;
        busRequestMsg.body.deviceContinuation = deviceContinuation;
        this.publishToOperatorsChannelAndWaitForReply<BusCreateDeviceContinuationReplyMessageBody>(context, busRequestMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorCreateDeviceContinuationReplyMessage();
                operatorReplyMsg.body.deviceContinuation = busReplyMsg.body.deviceContinuation;
                context.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}