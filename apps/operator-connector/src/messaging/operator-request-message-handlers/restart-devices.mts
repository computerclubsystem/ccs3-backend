import { createOperatorRestartDevicesReplyMessage, OperatorRestartDevicesRequestMessage } from '@computerclubsystem/types/messages/operators/operator-restart-devices.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { BusRestartDevicesReplyMessageBody, createBusRestartDevicesRequestMessage } from '@computerclubsystem/types/messages/bus/bus-restart-devices.messages.mjs';

export class RestartDevicesRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorRestartDevicesRequestMessage;
        const busReqMsg = createBusRestartDevicesRequestMessage();
        busReqMsg.body.deviceIds = message.body.deviceIds;
        this.publishToDevicesChannelAndWaitForReply<BusRestartDevicesReplyMessageBody>(context, busReqMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorRestartDevicesReplyMessage();
                operatorReplyMsg.body.targetsCount = busReplyMsg.body.targetsCount;
                context.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}