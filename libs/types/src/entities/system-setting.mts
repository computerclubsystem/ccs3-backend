import { SystemSettingsName } from './system-setting-name.mjs';
import { SystemSettingType } from './system-setting-type.mjs';

export interface SystemSetting {
    name: SystemSettingsName;
    type: SystemSettingType;
    description?: string;
    value?: string;
    allowedValues?: string;
}
