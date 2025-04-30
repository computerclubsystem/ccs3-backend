import { SystemSettingNameWithValue } from '@computerclubsystem/types/entities/system-setting-name-with-value.mjs';
import { SystemSettingsName } from '@computerclubsystem/types/entities/system-setting-name.mjs';
import { URL } from 'node:url';

export class SystemSettingsValidator {
    validateNameWithValues(systemSettingsNameWithValues: SystemSettingNameWithValue[]): ValidateNameWithValuesResult {
        const result: ValidateNameWithValuesResult = {
            failed: false,
        };
        for (const item of systemSettingsNameWithValues) {
            const settingName: SystemSettingsName = item.name as SystemSettingsName;
            switch (settingName) {
                case SystemSettingsName.device_status_refresh_interval: {
                    const val = item.value ? +item.value : 0;
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
                    const val = item.value ? +item.value : -1;
                    const isValid = val >= 0;
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
                    const val = item.value ? +item.value : 0;
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
                    const val = item.value ? +item.value : -1;
                    const isValid = val >= 0;
                    if (!isValid) {
                        result.failed = true;
                        result.errorCode = ValidateNameWithValuesErrorCode.outOfRange;
                        result.errorMessage = this.getOutOfRangeErrorMessage(item) + '. Valid values are >= 0';
                        return result;
                    }
                    break;
                }
                case SystemSettingsName.seconds_before_notifying_customers_for_session_end: {
                    // This setting can have two parts - number and path to a file separated with comma
                    if (!item.value || this.isNullOrWhiteSpace(item.value)) {
                        result.failed = true;
                        result.errorCode = ValidateNameWithValuesErrorCode.outOfRange;
                        result.errorMessage = this.getOutOfRangeErrorMessage(item) + '. Valid values are >= 0';
                        return result;
                    }
                    const parts = item.value.split(',', 2).map(x => x.trim());
                    const seconds = +parts[0];
                    const isSecondsValueValid = seconds >= 0;
                    if (!isSecondsValueValid) {
                        result.failed = true;
                        result.errorCode = ValidateNameWithValuesErrorCode.outOfRange;
                        result.errorMessage = this.getOutOfRangeErrorMessage(item) + '. Valid values are >= 0';
                        return result;
                    }
                    result.failed = false;
                    break;
                }
                case SystemSettingsName.feature_qrcode_sign_in_enabled: {
                    // This is always valid ("yes" or anything else)
                    result.failed = false;
                    break;
                }
                case SystemSettingsName.feature_qrcode_sign_in_server_public_url: {
                    // This must be URL
                    const value = item.value || '';
                    const canParseURL = URL.canParse(value || '');
                    if (!canParseURL) {
                        result.failed = true;
                        result.errorCode = ValidateNameWithValuesErrorCode.invalidUrl;
                        result.errorMessage = `Specified value '${value}' is not valid URL`;
                        return result;
                    }
                    const url = URL.parse(value);
                    if (url?.protocol.toLowerCase() !== 'https:') {
                        result.failed = true;
                        result.errorCode = ValidateNameWithValuesErrorCode.invalidUrl;
                        result.errorMessage = `URL must start with https://`;
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
    invalidUrl = 'invalid-url',
}

export interface ValidateNameWithValuesResult {
    failed: boolean;
    failedName?: string;
    errorMessage?: string;
    errorCode?: ValidateNameWithValuesErrorCode;
}
