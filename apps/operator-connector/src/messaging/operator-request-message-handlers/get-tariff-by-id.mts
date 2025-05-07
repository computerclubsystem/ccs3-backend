import { createOperatorGetTariffByIdReplyMessage, OperatorGetTariffByIdRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-tariff-by-id.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { BusGetTariffByIdReplyMessageBody, createBusGetTariffByIdRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-tariff-by-id.messages.mjs';

export class GetTariffByIdRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorGetTariffByIdRequestMessage;
        const busRequestMsg = createBusGetTariffByIdRequestMessage();
        busRequestMsg.body.tariffId = message.body.tariffId;
        this.publishToOperatorsChannelAndWaitForReply<BusGetTariffByIdReplyMessageBody>(context, busRequestMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetTariffByIdReplyMessage();
                operatorReplyMsg.body.tariff = busReplyMsg.body.tariff;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = context.errorReplyHelper.getCantGetTariffByIdErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}