import { SystemSettingNameWithValue } from '@computerclubsystem/types/entities/system-setting-name-with-value.mjs';
import { SystemSettingsName } from '@computerclubsystem/types/entities/system-setting-name.mjs';

export class SystemSettingsValidator {
    validateNameWithValues(systemSettingsNameWithValues: SystemSettingNameWithValue[]): ValidateNameWithValuesResult {
        const result: ValidateNameWithValuesResult = {
            failed: false,
        };
        for (const item of systemSettingsNameWithValues) {
            const settingName: SystemSettingsName = item.name as SystemSettingsName;
            switch (settingName) {
                case SystemSettingsName.device_status_refresh_interval: {
                    const val = +item.value!;
                    const isValid = val > 0 && val <= 30;
                    if (!isValid) {
                        result.failed = true;
                        result.errorCode = ValidateNameWithValuesErrorCode.outOfRange;
                        result.errorMessage = this.getOutOfRangeErrorMessage(item) + '. Valid values are >= 1 and <= 30';
                        return result;
                    }
                    break;
                }
                case SystemSettingsName.free_seconds_at_start: {
                    const val = +item.value!;
                    const isValid = !this.isNullOrWhiteSpace(item.value) && val >= 0;
                    if (!isValid) {
                        result.failed = true;
                        result.errorCode = ValidateNameWithValuesErrorCode.outOfRange;
                        result.errorMessage = this.getOutOfRangeErrorMessage(item) + '. Valid values are >= 0';
                        return result;
                    }
                    break;
                }
                case SystemSettingsName.timezone: {
                    // We will consider timezones always valid
                    // we could even have empty timezone which means to use the timezone configured on the server
                    result.failed = false;
                    break;
                }
                case SystemSettingsName.token_duration: {
                    const val = +item.value!;
                    const isValid = val >= 60;
                    if (!isValid) {
                        result.failed = true;
                        result.errorCode = ValidateNameWithValuesErrorCode.outOfRange;
                        result.errorMessage = this.getOutOfRangeErrorMessage(item) + '. Valid values are >= 60';
                        return result;
                    }
                    break;
                }
                case SystemSettingsName.seconds_before_restarting_stopped_computers: {
                    const val = +item.value!;
                    const isValid = !this.isNullOrWhiteSpace(item.value) && val >= 0;
                    if (!isValid) {
                        result.failed = true;
                        result.errorCode = ValidateNameWithValuesErrorCode.outOfRange;
                        result.errorMessage = this.getOutOfRangeErrorMessage(item) + '. Valid values are >= 0';
                        return result;
                    }
                    break;
                }
                default:
                    result.failed = true;
                    result.errorCode = ValidateNameWithValuesErrorCode.unknownSettingName;
                    result.errorMessage = `Setting name '${item.name}' is unknown`;
                    return result;
            }
        }
        return result;
    }

    private isNullOrWhiteSpace(value: string | null | undefined): boolean {
        if (!value) {
            return true;
        }
        if (value.trim().length === 0) {
            return true;
        }
        return false;
    }

    private getOutOfRangeErrorMessage(systemSettingNameWithValue: SystemSettingNameWithValue): string {
        return `The value '${systemSettingNameWithValue.value}' is out of range for the setting '${systemSettingNameWithValue.name}'`;
    }
}

export const enum ValidateNameWithValuesErrorCode {
    outOfRange = 'out-of-range',
    unknownSettingName = 'unknown-setting-name',
}

export interface ValidateNameWithValuesResult {
    failed: boolean;
    failedName?: string;
    errorMessage?: string;
    errorCode?: ValidateNameWithValuesErrorCode;
}
