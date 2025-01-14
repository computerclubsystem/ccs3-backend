export enum BusErrorCode {
    deviceAlreadyStarted = 'device-already-started',
    cantUseTheTariffNow = 'cant-use-the-tariff-now',
    cantStartTheTariffNow = 'cant-start-the-tariff-now',
    cantFindTariff = 'cant-find-tariff',
    userIdIsRequired = 'user-id-is-required',
    roleIdIsRequired = 'role-id-is-required',
    roleNameIsRequired = 'role-name-is-required',
    usernameIsRequired = 'username-is-required',
    roleNotFound = 'role-not-found',
    roleNotCreated = 'role-not-created',
    userNotCreated = 'user-not-created',
    userNotUpdated = 'user-not-updated',
    userNotFound = 'user-not-found',
    cantAuthenticateUser = 'cant-authenticate-user',
    passwordHashIsRequired = 'password-hash-is-required',
}
