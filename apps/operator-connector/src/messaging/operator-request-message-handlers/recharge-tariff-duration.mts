import { createOperatorRechargeTariffDurationReplyMessage, OperatorRechargeTariffDurationRequestMessage } from '@computerclubsystem/types/messages/operators/operator-recharge-tariff-duration.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { BusRechargeTariffDurationReplyMessageBody, createBusRechargeTariffDurationRequestMessage } from '@computerclubsystem/types/messages/bus/bus-recharge-tariff-duration.messages.mjs';
import { Tariff } from '@computerclubsystem/types/entities/tariff.mjs';

export class RechargeTariffDurationRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorRechargeTariffDurationRequestMessage;
        const busRequestMsg = createBusRechargeTariffDurationRequestMessage();
        busRequestMsg.body.tariffId = message.body.tariffId;
        busRequestMsg.body.userId = context.clientData.userId!;
        this.publishToOperatorsChannelAndWaitForReply<BusRechargeTariffDurationReplyMessageBody>(context, busRequestMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorRechargeTariffDurationReplyMessage();
                const tariff: Tariff = busReplyMsg.body.tariff;
                operatorReplyMsg.body.remainingSeconds = tariff?.remainingSeconds;
                context.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}