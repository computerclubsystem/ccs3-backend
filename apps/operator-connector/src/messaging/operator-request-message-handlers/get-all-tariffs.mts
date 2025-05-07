import { OperatorConnectionRoundTripData } from '@computerclubsystem/types/messages/operators/declarations/operator-connection-roundtrip-data.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { BusGetAllTariffsReplyMessageBody, createBusGetAllTariffsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-tariffs.messages.mjs';
import { createOperatorGetAllTariffsReplyMessage, OperatorGetAllTariffsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-tariffs.messages.mjs';

export class GetAllTariffsRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorGetAllTariffsRequestMessage;
        const busRequestMsg = createBusGetAllTariffsRequestMessage();
        busRequestMsg.body.types = message.body.types;
        busRequestMsg.header.roundTripData = {
            connectionId: context.clientData.connectionId,
            connectionInstanceId: context.clientData.connectionInstanceId,
        } as OperatorConnectionRoundTripData;
        this.publishToOperatorsChannelAndWaitForReply<BusGetAllTariffsReplyMessageBody>(context, busRequestMsg)
            .subscribe(busReplyMessage => {
                const operatorReplyMsg = createOperatorGetAllTariffsReplyMessage();
                operatorReplyMsg.body.tariffs = busReplyMessage.body.tariffs;
                context.errorReplyHelper.setBusMessageFailure(busReplyMessage, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}