import { createOperatorShutdownStoppedReplyMessage, OperatorShutdownStoppedRequestMessage } from '@computerclubsystem/types/messages/operators/operator-shutdown-stopped.messages.mjs';
import { BusShutdownStoppedReplyMessageBody, createBusShutdownStoppedRequestMessage } from '@computerclubsystem/types/messages/bus/bus-shutdown-stopped.messages.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';

export class ShutdownStoppedRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorShutdownStoppedRequestMessage;
        const busReqMsg = createBusShutdownStoppedRequestMessage();
        this.publishToDevicesChannelAndWaitForReply<BusShutdownStoppedReplyMessageBody>(context, busReqMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorShutdownStoppedReplyMessage();
                operatorReplyMsg.body.targetsCount = busReplyMsg.body.targetsCount;
                context.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}
