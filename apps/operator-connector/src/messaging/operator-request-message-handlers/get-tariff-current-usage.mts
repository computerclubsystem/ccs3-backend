import { createOperatorGetTariffCurrentUsageReplyMessage, OperatorGetTariffCurrentUsageRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-tariff-current-usage.mjs';
import { BusGetTariffCurrentUsageReplyMessageBody, createBusGetTariffCurrentUsageRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-tariff-current-usage.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';

export class GetTariffCurrentUsageRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorGetTariffCurrentUsageRequestMessage;
        const busReqMsg = createBusGetTariffCurrentUsageRequestMessage();
        busReqMsg.body.tariffId = message.body.tariffId;
        this.publishToOperatorsChannelAndWaitForReply<BusGetTariffCurrentUsageReplyMessageBody>(context, busReqMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetTariffCurrentUsageReplyMessage();
                operatorReplyMsg.body.devicesWithTariffs = busReplyMsg.body.devicesWithTariffs;
                context.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}