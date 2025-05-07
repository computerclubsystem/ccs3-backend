import { createOperatorGetAllDevicesReplyMessage, OperatorGetAllDevicesRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-devices.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { BusOperatorGetAllDevicesReplyMessageBody, createBusGetAllDevicesRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-devices.messages.mjs';
import { OperatorConnectionRoundTripData } from '@computerclubsystem/types/messages/operators/declarations/operator-connection-roundtrip-data.mjs';

export class GetAllDevicesRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorGetAllDevicesRequestMessage;
        const busRequestMsg = createBusGetAllDevicesRequestMessage();
        busRequestMsg.header.roundTripData = {
            connectionId: context.clientData.connectionId,
            connectionInstanceId: context.clientData.connectionInstanceId,
        } as OperatorConnectionRoundTripData;
        this.publishToOperatorsChannelAndWaitForReply<BusOperatorGetAllDevicesReplyMessageBody>(context, busRequestMsg)
            .subscribe(busReplyMessage => {
                const operatorReplyMsg = createOperatorGetAllDevicesReplyMessage();
                operatorReplyMsg.body.devices = busReplyMessage.body.devices;
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}