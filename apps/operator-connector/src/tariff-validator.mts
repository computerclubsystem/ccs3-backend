import { Tariff } from '@computerclubsystem/types/entities/tariff.mjs';
import { MessageError } from '@computerclubsystem/types/messages/declarations/message-error.mjs';
import { OperatorReplyMessageErrorCode } from '@computerclubsystem/types/messages/operators/declarations/error-code.mjs';
import { createOperatorCreateTariffReplyMessage, OperatorCreateTariffReplyMessage } from '@computerclubsystem/types/messages/operators/operator-create-tariff-reply.message.mjs';

export class TariffValidator {
    validateTariff(tariff: Tariff): OperatorCreateTariffReplyMessage | null {
        if (!tariff) {
            const operatorErrorReplyMsg = createOperatorCreateTariffReplyMessage();
            operatorErrorReplyMsg.header.failure = true;
            operatorErrorReplyMsg.header.errors = [{
                code: OperatorReplyMessageErrorCode.tariffNotProvided,
                description: 'Tariff is not provided'
            }] as MessageError[];
            return operatorErrorReplyMsg;
        }
        if (!(tariff.price > 0)) {
            const operatorReplyMsg = createOperatorCreateTariffReplyMessage();
            operatorReplyMsg.header.failure = true;
            operatorReplyMsg.header.errors = [{
                code: OperatorReplyMessageErrorCode.tariffPriceIsZeroOrLess,
                description: 'Tariff price must be positive number'
            }] as MessageError[];
            return operatorReplyMsg;
        }
        return null;
    }
}
