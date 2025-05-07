import { BusShutdownDevicesReplyMessageBody, createBusShutdownDevicesRequestMessage } from '@computerclubsystem/types/messages/bus/bus-shutdown-devices.messages.mjs';
import { createOperatorShutdownDevicesReplyMessage, OperatorShutdownDevicesRequestMessage } from '@computerclubsystem/types/messages/operators/operator-shutdown-devices.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';

export class ShutdownDevicesRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorShutdownDevicesRequestMessage;
        const busReqMsg = createBusShutdownDevicesRequestMessage();
        busReqMsg.body.deviceIds = message.body.deviceIds;
        this.publishToDevicesChannelAndWaitForReply<BusShutdownDevicesReplyMessageBody>(context, busReqMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorShutdownDevicesReplyMessage();
                operatorReplyMsg.body.targetsCount = busReplyMsg.body.targetsCount;
                context.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}