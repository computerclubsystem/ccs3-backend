import { BusErrorCode } from '@computerclubsystem/types/messages/bus/declarations/bus-error-code.mjs';
import { MessageError } from '@computerclubsystem/types/messages/declarations/message-error.mjs';
import { OperatorReplyMessageErrorCode } from '@computerclubsystem/types/messages/operators/declarations/error-code.mjs';

export class ErrorReplyHelper {
    cantUpdateRoleWithPermissionsErrors(busMessageErrors: MessageError[] | undefined): MessageError[] {
        let messageErrors: MessageError[];
        if (busMessageErrors?.find(x => x.code === BusErrorCode.roleIdIsRequired)) {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.roleIdIsRequired,
                description: `Role Id is required.`,
            }] as MessageError[];
        } else if (busMessageErrors?.find(x => x.code === BusErrorCode.roleNotFound)) {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.roleNotFound,
                description: `Can't find role with specified Id.`,
            }] as MessageError[];
        } else {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.cantUpdateRoleWithPermissions,
                description: `Can't update role with permissions. Check if role with the same name already exists.`,
            }] as MessageError[];
        }
        return messageErrors;
    }
    cantCreateRoleWithPermissionsErrors(busMessageErrors: MessageError[] | undefined): MessageError[] {
        let messageErrors: MessageError[];
        messageErrors = [{
            code: OperatorReplyMessageErrorCode.cantCreateRoleWithPermissions,
            description: `Can't crate role with permissions. Check if role with the same name already exists.`,
        }] as MessageError[];
        return messageErrors;
    }

    cantGetAllPermissionsErrors(busMessageErrors: MessageError[] | undefined): MessageError[] {
        let messageErrors: MessageError[];
        messageErrors = [{
            code: OperatorReplyMessageErrorCode.cantGetAllPermissions,
            description: `Can't get all permissions.`,
        }] as MessageError[];
        return messageErrors;
    }

    cantGetAllRoleWithPermissionsErrors(busMessageErrors: MessageError[] | undefined): MessageError[] {
        let messageErrors: MessageError[];
        if (busMessageErrors?.find(x => x.code === BusErrorCode.roleNotFound)) {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.roleNotFound,
                description: `Can't find role with specified Id.`,
            }] as MessageError[];
        } else {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.cantGetRoleWithPermissions,
                description: `Can't get role with permissions.`,
            }] as MessageError[];
        }
        return messageErrors;
    }

    cantGetAllRolesErrors(busMessageErrors: MessageError[] | undefined): MessageError[] {
        let messageErrors: MessageError[];
        messageErrors = [{
            code: OperatorReplyMessageErrorCode.cantGetAllRoles,
            description: `Can't get all roles.`,
        }] as MessageError[];
        return messageErrors;
    }

    getCantUpdateTariffErrors(busMessageErrors: MessageError[] | undefined): MessageError[] {
        let messageErrors: MessageError[];
        if (busMessageErrors?.find(x => x.code === BusErrorCode.cantFindTariff)) {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.cantFindTariff,
                description: `Can't find tariff with specified Id.`,
            }] as MessageError[];
        } else if (busMessageErrors?.find(x => x.code === BusErrorCode.userIdIsRequired)) {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.userIdIsRequired,
                description: `User Id is required.`,
            }] as MessageError[];
        } else {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.cantFindTariff,
                description: `Can't find tariff.`,
            }] as MessageError[];
        }
        return messageErrors;
    }

    getCantGetTariffByIdErrors(busMessageErrors: MessageError[] | undefined): MessageError[] {
        let messageErrors: MessageError[];
        if (busMessageErrors?.find(x => x.code === BusErrorCode.cantFindTariff)) {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.cantFindTariff,
                description: `Can't find tariff with specified Id.`,
            }] as MessageError[];
        } else {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.cantFindTariff,
                description: `Can't find tariff.`,
            }] as MessageError[];
        }
        return messageErrors;
    }

    getCantStartTheDeviceErrors(busMessageErrors: MessageError[] | undefined): MessageError[] {
        let messageErrors: MessageError[];
        if (busMessageErrors?.find(x => x.code === BusErrorCode.deviceAlreadyStarted)) {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.deviceAlreadyStarted,
                description: `Can't start the device. It is already started.`,
            }] as MessageError[];
        } else if (busMessageErrors?.find(x => x.code === BusErrorCode.cantUseTheTariffNow)) {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.cantUseTheTariffNow,
                description: `Can't start the device. The tariff can't be used right now.`,
            }] as MessageError[];
        } else if (busMessageErrors?.find(x => x.code === BusErrorCode.cantStartTheTariffNow)) {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.cantStartTheTariffNow,
                description: `Can't start the device. The tariff can't be started right now.`,
            }] as MessageError[];
        } else {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.cantStartDevice,
                description: `Can't start the device. Check if it is already started.`,
            }] as MessageError[];
        }
        return messageErrors;
    }
}
