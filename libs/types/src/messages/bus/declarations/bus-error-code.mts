export enum BusErrorCode {
    cantCreateDeviceGroup = 'cant-create-device-group',
    deviceGroupIsRequired = 'device-group-is-required',
    deviceGroupNotFound = 'device-group-not-found',
    deviceGroupIdIsRequired = 'device-group-id-is-required',
    nameCannotBeEmpty = 'name-cannot-be-empty',
    serverError = 'server-error',
    deviceAlreadyStarted = 'device-already-started',
    deviceIdIsRequired = 'device-id-is-required',
    deviceIpAddressIsRequired = 'device-ip-address-is-required',
    tariffIdIsRequired = 'tariff-id-is-required',
    deviceIsNotStarted = 'device-is-not-started',
    deviceIsInUse = 'device-is-in-use',
    deviceNotFound = 'device-not-found',
    deviceIsNotTransferrable = 'device-is-not-transferrable',
    tariffNotFound = 'tariff-not-found',
    tariffNotProvided = 'tariff-not-provided',
    deviceIsNotActive = 'device-is-not-active',
    tariffIsNotAvailable = 'tariff-is-not-available',
    tariffIsNotActive = 'tariff-is-not-active',
    tariffIsNotPrepaidType = 'tariff-is-not-prepaid-type',
    tariffMustNotBeOfPrepaidType = 'tariff-must-not-be-of-prepaid-type',
    cantUseTheTariffNow = 'cant-use-the-tariff-now',
    cantStartTheTariffNow = 'cant-start-the-tariff-now',
    cantStartTheTariffAtSpecifiedTime = 'cant-start-the-tariff-at-specified-time',
    prepaidTariffAlreadyInUse = 'prepaid-tariff-already-in-use',
    prepaidTariffIsRequired = 'prepaid-tariff-is-required',
    cantFindTariff = 'cant-find-tariff',
    cantUpdateTariff = 'cant-update-tariff',
    cantIncreaseTariffRemainingTime = 'cant-increase-tariff-remaining-time',
    userIdIsRequired = 'user-id-is-required',
    userIdMustNotBeProvided = 'user-id-must-not-be-provided',
    roleIdIsRequired = 'role-id-is-required',
    roleNameIsRequired = 'role-name-is-required',
    usernameIsRequired = 'username-is-required',
    roleNotFound = 'role-not-found',
    roleNotCreated = 'role-not-created',
    userNotCreated = 'user-not-created',
    userIsNotActive = 'user-is-not-active',
    userNotUpdated = 'user-not-updated',
    userNotFound = 'user-not-found',
    cantAuthenticateUser = 'cant-authenticate-user',
    passwordHashIsRequired = 'password-hash-is-required',
    invalidPasswordHash = 'invalid-password-hash',
    allIdsAreRequired = 'all-ids-are-required',
    sourceDeviceMustBeStarted = 'source-device-must-be-started',
    targetDeviceMustBeStopped = 'source-device-must-be-stopped',
    objectIsRequired = 'object-is-required',
    durationMustBePositiveValue = 'duration-must-be-positive-value',
    priceMustBePositiveValue = 'price-must-be-positive-value',
    timeMustBePositiveValue = 'time-must-be-positive-value',
    noRemainingTimeLeft = 'no-remaining-time-left',
    passwordDoesNotMatch = 'password-does-not-match',
    shiftStatusesDoesNotMatch = 'shift-status-does-not-match',
    invalidDate = 'invalid-date',
    cannotCompleteShift = 'cannot-complete-shift',
    targetDeviceIsNotAvailableForTransfer = 'target-device-is-not-available-for-transfer',
}
