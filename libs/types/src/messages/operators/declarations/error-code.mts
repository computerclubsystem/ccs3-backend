export const enum OperatorReplyMessageErrorCode {
    tariffNotProvided = 'tariff-not-provided',
    tariffPriceIsZeroOrLess = 'tariff-price-is-zero-or-less',
    tariffCreationError = 'tariff-creation-error',
    deviceAlreadyStarted = 'device-already-started',
    cantStartDevice = 'cant-start-device',
    cantUseTheTariffNow = 'cant-use-the-tariff-now',
    cantStartTheTariffNow = 'cant-start-the-tariff-now',
    unknownTariffType = 'unknown-tariff-type',
    cantFindTariff = 'cant-find-tariff',
    userIdIsRequired = 'user-id-is-required',
    usernameIsRequired = 'username-is-required',
    roleIdIsRequired = 'role-id-is-required',
    cantGetAllRoles = 'cant-get-all-roles',
    cantGetRoleWithPermissions = 'cant-get-role-with-permissions',
    roleNotFound = 'role-not-found',
    userNotFound = 'user-not-found',
    cantGetAllPermissions = 'cant-get-all-permissions',
    cantGetAllUsers = 'cant-get-all-users',
    cantCreateRoleWithPermissions = 'cant-create-role-with-permissions',
    cantUpdateRoleWithPermissions = 'cant-update-role-with-permissions',
    cantGetUserWithRoles = 'cant-get-user-with-roles',
    cantCreateUserWithRoles = 'cant-create-user-with-roles',
    cantUpdateUserWithRoles = 'cant-update-user-with-roles',
    passwordHashIsRequired = 'password-hash-is-required',
    notAuthenticated = 'not-authenticated',
    notAuthorized = 'not-authorized',
    cantAuthenticate = 'cant-authenticate',
}
