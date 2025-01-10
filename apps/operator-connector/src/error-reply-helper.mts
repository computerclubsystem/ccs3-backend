import { BusErrorCode } from '@computerclubsystem/types/messages/bus/declarations/bus-error-code.mjs';
import { MessageError } from '@computerclubsystem/types/messages/declarations/message-error.mjs';
import { OperatorReplyMessageErrorCode } from '@computerclubsystem/types/messages/operators/declarations/error-code.mjs';

export class ErrorReplyHelper {
    getCantUpdateTariffErrors(busMessageErrors: MessageError[] | undefined): MessageError[] {
        let messageErrors: MessageError[];
        if (busMessageErrors?.find(x => x.code === BusErrorCode.cantFindTariff)) {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.cantFindTariff,
                description: `Can't find tariff with specified Id`,
            }] as MessageError[];
        } else if (busMessageErrors?.find(x => x.code === BusErrorCode.userIdIsRequired)) {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.userIdIsRequired,
                description: `User Id is required`,
            }] as MessageError[];
        } else {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.cantFindTariff,
                description: `Can't find tariff`,
            }] as MessageError[];
        }
        return messageErrors;
    }

    getCantGetTariffByIdErrors(busMessageErrors: MessageError[] | undefined): MessageError[] {
        let messageErrors: MessageError[];
        if (busMessageErrors?.find(x => x.code === BusErrorCode.cantFindTariff)) {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.cantFindTariff,
                description: `Can't find tariff with specified Id`,
            }] as MessageError[];
        } else {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.cantFindTariff,
                description: `Can't find tariff`,
            }] as MessageError[];
        }
        return messageErrors;
    }

    getCantStartTheDeviceErrors(busMessageErrors: MessageError[] | undefined): MessageError[] {
        let messageErrors: MessageError[];
        if (busMessageErrors?.find(x => x.code === BusErrorCode.deviceAlreadyStarted)) {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.deviceAlreadyStarted,
                description: `Can't start the device. It is already started`,
            }] as MessageError[];
        } else if (busMessageErrors?.find(x => x.code === BusErrorCode.cantUseTheTariffNow)) {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.cantUseTheTariffNow,
                description: `Can't start the device. The tariff can't be used right now`,
            }] as MessageError[];
        } else if (busMessageErrors?.find(x => x.code === BusErrorCode.cantStartTheTariffNow)) {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.cantStartTheTariffNow,
                description: `Can't start the device. The tariff can't be started right now`,
            }] as MessageError[];
        } else {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.cantStartDevice,
                description: `Can't start the device. Check if it is already started`,
            }] as MessageError[];
        }
        return messageErrors;
    }
}
