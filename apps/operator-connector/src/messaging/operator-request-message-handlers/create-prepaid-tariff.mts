import { createOperatorCreatePrepaidTariffReplyMessage, OperatorCreatePrepaidTariffRequestMessage } from '@computerclubsystem/types/messages/operators/operator-create-prepaid-tariff.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { createOperatorCreateTariffReplyMessage } from '@computerclubsystem/types/messages/operators/operator-create-tariff.messages.mjs';
import { OperatorReplyMessageErrorCode } from '@computerclubsystem/types/messages/operators/declarations/error-code.mjs';
import { MessageError } from '@computerclubsystem/types/messages/declarations/message-error.mjs';
import { Tariff } from '@computerclubsystem/types/entities/tariff.mjs';
import { BusCreatePrepaidTariffReplyMessageBody, createBusCreatePrepaidTariffRequestMessage } from '@computerclubsystem/types/messages/bus/bus-create-prepaid-tariff.messages.mjs';

export class CreatePrepaidTariffRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorCreatePrepaidTariffRequestMessage;
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

        const busRequestMsg = createBusCreatePrepaidTariffRequestMessage();
        busRequestMsg.body.tariff = requestedTariff;
        busRequestMsg.body.passwordHash = message.body.passwordHash;
        busRequestMsg.body.userId = context.clientData.userId!;
        busRequestMsg.body.deviceGroupIds = message.body.deviceGroupIds;
        this.publishToOperatorsChannelAndWaitForReply<BusCreatePrepaidTariffReplyMessageBody>(context, busRequestMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorCreatePrepaidTariffReplyMessage();
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