import { createOperatorGetDeviceByIdReplyMessage, OperatorGetDeviceByIdRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-device-by-id.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { BusDeviceGetByIdReplyMessageBody, createBusDeviceGetByIdRequestMessage } from '@computerclubsystem/types/messages/bus/bus-device-get-by-id.messages.mjs';
import { OperatorConnectionRoundTripData } from '@computerclubsystem/types/messages/operators/declarations/operator-connection-roundtrip-data.mjs';

export class GetDeviceByIdRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorGetDeviceByIdRequestMessage;
        const busRequestMsg = createBusDeviceGetByIdRequestMessage();
        busRequestMsg.body.deviceId = message.body.deviceId;
        // TODO: Do we need this roundTripData ? We are now waiting for reply by type
        busRequestMsg.header.roundTripData = {
            connectionId: context.clientData.connectionId,
            connectionInstanceId: context.clientData.connectionInstanceId,
        } as OperatorConnectionRoundTripData;
        this.publishToOperatorsChannelAndWaitForReply<BusDeviceGetByIdReplyMessageBody>(context, busRequestMsg)
            .subscribe(busReplyMessage => {
                const operatorReplyMsg = createOperatorGetDeviceByIdReplyMessage();
                operatorReplyMsg.body.device = busReplyMessage.body.device;
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}