import { createOperatorUpdateDeviceReplyMessage, OperatorUpdateDeviceRequestMessage } from '@computerclubsystem/types/messages/operators/operator-update-device.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { BusUpdateDeviceReplyMessageBody, createBusUpdateDeviceRequestMessage } from '@computerclubsystem/types/messages/bus/bus-update-device.messages.mjs';
import { OperatorConnectionRoundTripData } from '@computerclubsystem/types/messages/operators/declarations/operator-connection-roundtrip-data.mjs';

export class UpdateDeviceRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorUpdateDeviceRequestMessage;
        const busRequestMsg = createBusUpdateDeviceRequestMessage();
        busRequestMsg.body.device = message.body.device;
        busRequestMsg.header.roundTripData = {
            connectionId: context.clientData.connectionId,
            connectionInstanceId: context.clientData.connectionInstanceId,
        } as OperatorConnectionRoundTripData;
        this.publishToOperatorsChannelAndWaitForReply<BusUpdateDeviceReplyMessageBody>(context, busRequestMsg)
            .subscribe(busReplyMessage => {
                const operatorReplyMsg = createOperatorUpdateDeviceReplyMessage();
                operatorReplyMsg.body.device = busReplyMessage.body.device;
                context.errorReplyHelper.setBusMessageFailure(busReplyMessage, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}