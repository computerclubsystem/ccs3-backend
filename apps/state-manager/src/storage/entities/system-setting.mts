import { SystemSettingsName } from './constants/system-setting-names.mjs';
import { SystemSettingType } from './constants/system-setting-type.mjs';

export interface ISystemSetting {
    name: SystemSettingsName;
    type: SystemSettingType;
    description?: string;
    value?: string;
    allowedValues?: string;
}
