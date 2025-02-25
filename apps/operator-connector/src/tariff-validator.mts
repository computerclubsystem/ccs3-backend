import { Tariff, TariffType } from '@computerclubsystem/types/entities/tariff.mjs';

// TODO: Move this to utils library
export class TariffValidator {
    validateTariff(tariff: Tariff): ValidateTariffResult {
        const result = { success: false } as ValidateTariffResult;
        if (!tariff) {
            result.errorCode = ValidateTariffErrorCode.tariffNotProvided;
            result.errorMessage = 'Tariff not provided';
            return result;
        }
        if (this.isWhiteSpace(tariff.name)) {
            result.errorCode = ValidateTariffErrorCode.nameIsEmpty;
            result.errorMessage = 'The name is empty';
            return result;
        }
        if (!(tariff.price >= 0)) {
            result.errorCode = ValidateTariffErrorCode.priceMustBeEqualOrGreaterThanZero;
            result.errorMessage = `Price must be equal or greater than zero. It is '${tariff.price}'`;
            return result;
        }

        switch (tariff.type) {
            case TariffType.duration: {
                const isDurationPositive = tariff.duration! > 0;
                if (!isDurationPositive) {
                    result.errorCode = ValidateTariffErrorCode.durationMustBeGreaterThanZero;
                    result.errorMessage = `Duration '${tariff.duration}' must be positive`;
                    return result;
                }
                if (tariff.restrictStartTime) {
                    const isInRange = this.isTimeInRange(tariff.restrictStartFromTime) && this.isTimeInRange(tariff.restrictStartToTime);
                    if (!isInRange) {
                        result.errorCode = ValidateTariffErrorCode.restrictFromAndRestrictToMustBeBetweenZeroAnd1439;
                        result.errorMessage = `Restrict From '${tariff.restrictStartFromTime}' and restrict To '${tariff.restrictStartToTime}' values must be between 0 and 1439`;
                        return result;
                    }
                    if (tariff.restrictStartFromTime === tariff.restrictStartToTime) {
                        result.errorCode = ValidateTariffErrorCode.fromAndToMustNotBeTheSame;
                        result.errorMessage = `Restrict from '${tariff.restrictStartFromTime}' and restrict To '${tariff.restrictStartToTime}' values must not be the same`;
                        return result;
                    }
                }
                break;
            }
            case TariffType.fromTo: {
                const isInRange = this.isTimeInRange(tariff.fromTime) && this.isTimeInRange(tariff.toTime);
                if (!isInRange) {
                    result.errorCode = ValidateTariffErrorCode.fromAndToMustBeBetweenZeroAnd1439;
                    result.errorMessage = `From '${tariff.fromTime}' and To '${tariff.toTime}' values must be between 0 and 1439`;
                    return result;
                }
                if (tariff.fromTime === tariff.toTime) {
                    result.errorCode = ValidateTariffErrorCode.fromAndToMustNotBeTheSame;
                    result.errorMessage = `From '${tariff.fromTime}' and To '${tariff.toTime}' values must not be the same`;
                    return result;
                }
                break;
            }
            case TariffType.prepaid: {
                const isDurationPositive = tariff.duration! > 0;
                if (!isDurationPositive) {
                    result.errorCode = ValidateTariffErrorCode.durationMustBeGreaterThanZero;
                    result.errorMessage = `Duration '${tariff.duration}' must be positive`;
                    return result;
                }
                break;
            }
            default: {
                result.errorCode = ValidateTariffErrorCode.unknownTariffType;
                result.errorMessage = `Unknown tariff type '${tariff.type}'`;
                return result;
            }
        }
        result.success = true;
        return result;
    }

    private isWhiteSpace(string?: string): boolean {
        return !(string?.trim());
    }

    private isTimeInRange(value?: number | null): boolean {
        if (value === undefined || value === null) {
            return false;
        }
        return value >= 0 && value <= 1439;
    }
}

export enum ValidateTariffErrorCode {
    tariffNotProvided = 'tariff-not-provided',
    priceMustBeEqualOrGreaterThanZero = 'price-must-be-equal-or-greater-than-0',
    durationMustBeGreaterThanZero = 'duration-must-be-greater-than-0',
    fromAndToMustBeBetweenZeroAnd1439 = 'from-and-to-must-be-between-0-and-1439',
    restrictFromAndRestrictToMustBeBetweenZeroAnd1439 = 'restrict-from-and-restrict-to-must-be-between-0-and-1439',
    fromAndToMustNotBeTheSame = 'from-and-to-must-not-be-the-same',
    nameIsEmpty = 'name-is-empty',
    unknownTariffType = 'unknown-tariff-type',
}

export interface ValidateTariffResult {
    success: boolean;
    errorCode?: ValidateTariffErrorCode;
    errorMessage?: string;
}
