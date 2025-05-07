import { createOperatorCreateTariffReplyMessage, OperatorCreateTariffRequestMessage } from '@computerclubsystem/types/messages/operators/operator-create-tariff.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { OperatorReplyMessageErrorCode } from '@computerclubsystem/types/messages/operators/declarations/error-code.mjs';
import { MessageError } from '@computerclubsystem/types/messages/declarations/message-error.mjs';
import { Tariff } from '@computerclubsystem/types/entities/tariff.mjs';
import { BusCreateTariffReplyMessageBody, createBusCreateTariffRequestMessage } from '@computerclubsystem/types/messages/bus/bus-create-tariff.messages.mjs';

export class CreateTariffRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorCreateTariffRequestMessage;
        const validateTariffResult = context.operatorConnectorValidators.tariff.validateTariff(message.body.tariff);
        if (!validateTariffResult.success) {
            const errorReplyMsg = createOperatorCreateTariffReplyMessage();
            errorReplyMsg.header.failure = true;
            errorReplyMsg.header.errors = [{
                code: OperatorReplyMessageErrorCode.tariffCreationError,
                description: `${validateTariffResult.errorCode}: ${validateTariffResult.errorMessage}`,
            }] as MessageError[];
            this.sendReplyMessageToOperator(context, errorReplyMsg, message);
            return;
        }
        const requestedTariff: Tariff = message.body.tariff;
        requestedTariff.description = requestedTariff.description?.trim();
        requestedTariff.name = requestedTariff.name.trim();

        const busRequestMsg = createBusCreateTariffRequestMessage();
        busRequestMsg.body.tariff = requestedTariff;
        busRequestMsg.body.userId = context.clientData.userId!;
        busRequestMsg.body.deviceGroupIds = message.body.deviceGroupIds;
        this.publishToOperatorsChannelAndWaitForReply<BusCreateTariffReplyMessageBody>(context, busRequestMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorCreateTariffReplyMessage();
                operatorReplyMsg.body.tariff = busReplyMsg.body.tariff;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = [{
                        code: OperatorReplyMessageErrorCode.tariffCreationError,
                        description: `Can't create tariff. Check if tariff with the same name already exist`,
                    }] as MessageError[];
                }
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}