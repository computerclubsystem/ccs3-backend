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
}
