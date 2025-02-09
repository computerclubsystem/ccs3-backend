import { BusErrorCode } from '@computerclubsystem/types/messages/bus/declarations/bus-error-code.mjs';
import { MessageError } from '@computerclubsystem/types/messages/declarations/message-error.mjs';
import { Message } from '@computerclubsystem/types/messages/declarations/message.mjs';
import { OperatorReplyMessageErrorCode } from '@computerclubsystem/types/messages/operators/declarations/error-code.mjs';
import { OperatorRequestMessage, OperatorReplyMessage } from '@computerclubsystem/types/messages/operators/declarations/operator.message.mjs';

export class ErrorReplyHelper {
    setBusMessageFailure(busMessage: Message<any>, requestMessage: OperatorRequestMessage<any>, replyMessage: OperatorReplyMessage<any>): void {
        if (busMessage.header.failure) {
            const firstErrorCode = busMessage.header.errors?.[0]?.code || '';
            replyMessage.header.failure = true;
            replyMessage.header.errors = [{ code: firstErrorCode, description: `Can't process message '${requestMessage?.header?.type}'` }];
        }
    }

    updateUserWithRolesErrors(busMessageErrors: MessageError[] | undefined): MessageError[] {
        let messageErrors: MessageError[];
        if (busMessageErrors?.find(x => x.code === BusErrorCode.userIdIsRequired)) {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.userIdIsRequired,
                description: `User Id is required.`,
            }] as MessageError[];
        } else {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.cantGetUserWithRoles,
                description: `Can't create user with roles. Check if the user with specified username already exists.`,
            }] as MessageError[];
        }
        return messageErrors;
    }

    createUserWithRolesErrors(busMessageErrors: MessageError[] | undefined): MessageError[] {
        let messageErrors: MessageError[];
        if (busMessageErrors?.find(x => x.code === BusErrorCode.usernameIsRequired)) {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.usernameIsRequired,
                description: `Username is required.`,
            }] as MessageError[];
        } else if (busMessageErrors?.find(x => x.code === BusErrorCode.passwordHashIsRequired)) {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.passwordHashIsRequired,
                description: `Password sha512 hash is required.`,
            }] as MessageError[];
        } else {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.cantCreateUserWithRoles,
                description: `Can't create user with roles. Check if the user with specified username already exists.`,
            }] as MessageError[];
        }
        return messageErrors;
    }

    getUserWithRolesErrors(busMessageErrors: MessageError[] | undefined): MessageError[] {
        let messageErrors: MessageError[];
        if (busMessageErrors?.find(x => x.code === BusErrorCode.userIdIsRequired)) {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.userIdIsRequired,
                description: `User Id is required.`,
            }] as MessageError[];
        } else if (busMessageErrors?.find(x => x.code === BusErrorCode.userNotFound)) {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.userNotFound,
                description: `Can't find user with specified Id.`,
            }] as MessageError[];
        } else {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.cantGetUserWithRoles,
                description: `Can't get user with roles. Check if user with specified Id exists.`,
            }] as MessageError[];
        }
        return messageErrors;
    }

    cantGetUserWithRolesErrors(busMessageErrors: MessageError[] | undefined): MessageError[] {
        let messageErrors: MessageError[];
        if (busMessageErrors?.find(x => x.code === BusErrorCode.userIdIsRequired)) {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.userIdIsRequired,
                description: `User Id is required.`,
            }] as MessageError[];
        } else {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.cantGetUserWithRoles,
                description: `Can't get role with permissions.`,
            }] as MessageError[];
        }
        return messageErrors;
    }

    cantGetAllUsersErrors(busMessageErrors: MessageError[] | undefined): MessageError[] {
        let messageErrors: MessageError[];
        messageErrors = [{
            code: OperatorReplyMessageErrorCode.cantGetAllUsers,
            description: `Can't get all users.`,
        }] as MessageError[];
        return messageErrors;
    }

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
        if (busMessageErrors?.find(x => x.code === BusErrorCode.prepaidTariffAlreadyInUse)) {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.prepaidTariffAlreadyInUse,
                description: busMessageErrors[0].description || `Selected prepaid tariff is already in use.`,
            }] as MessageError[];
        } else if (busMessageErrors?.find(x => x.code === BusErrorCode.deviceAlreadyStarted)) {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.deviceAlreadyStarted,
                description: `Can't start the device. It is already started.`,
            }] as MessageError[];
        } else if (busMessageErrors?.find(x => x.code === BusErrorCode.cantUseTheTariffNow)) {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.cantUseTheTariffNow,
                description: `Can't start the device. The tariff can't be used right now.`,
            }] as MessageError[];
        } else if (busMessageErrors?.find(x => x.code === BusErrorCode.noRemainingTimeLeft)) {
            messageErrors = [{
                code: OperatorReplyMessageErrorCode.noRemainingTimeLeft,
                description: `The tariff does not have remaining time.`,
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
