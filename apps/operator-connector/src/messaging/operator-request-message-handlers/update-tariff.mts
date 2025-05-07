import { createOperatorUpdateTariffReplyMessage, OperatorUpdateTariffRequestMessage } from '@computerclubsystem/types/messages/operators/operator-update-tariff.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { OperatorReplyMessageErrorCode } from '@computerclubsystem/types/messages/operators/declarations/error-code.mjs';
import { MessageError } from '@computerclubsystem/types/messages/declarations/message-error.mjs';
import { createBusUpdateTariffRequestMessage } from '@computerclubsystem/types/messages/bus/bus-update-tariff.messages.mjs';
import { BusGetTariffByIdReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-get-tariff-by-id.messages.mjs';

export class UpdateTariffRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorUpdateTariffRequestMessage;
        const validateTariffResult = context.operatorConnectorValidators.tariff.validateTariff(message.body.tariff);
        if (!validateTariffResult.success) {
            const errorReplyMsg = createOperatorUpdateTariffReplyMessage();
            errorReplyMsg.header.failure = true;
            errorReplyMsg.header.errors = [{
                code: OperatorReplyMessageErrorCode.tariffCreationError,
                description: `${validateTariffResult.errorCode}: ${validateTariffResult.errorMessage}`,
            }] as MessageError[];
            this.sendReplyMessageToOperator(context, errorReplyMsg, message);
            return;
        }

        const busRequestMsg = createBusUpdateTariffRequestMessage();
        busRequestMsg.body.tariff = message.body.tariff;
        busRequestMsg.body.passwordHash = message.body.passwordHash;
        busRequestMsg.body.userId = context.clientData.userId!;
        busRequestMsg.body.deviceGroupIds = message.body.deviceGroupIds;
        this.publishToOperatorsChannelAndWaitForReply<BusGetTariffByIdReplyMessageBody>(context, busRequestMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorUpdateTariffReplyMessage();
                operatorReplyMsg.body.tariff = busReplyMsg.body.tariff;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = context.errorReplyHelper.getCantUpdateTariffErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}