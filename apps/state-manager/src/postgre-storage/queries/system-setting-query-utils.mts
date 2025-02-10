import { ISystemSettingNameWithValue } from 'src/storage/entities/system-setting-name-with-value.mjs';
import { IQueryTextWithParamsResult } from './query-with-params.mjs';
import { UpdateQueryBuilder } from './query-builder.mjs';

export class SystemSettingQueryUtils {
    updateSystemSettingValueQueryData(systemSettingNameWithValue: ISystemSettingNameWithValue): IQueryTextWithParamsResult {
        const updateBuilder = new UpdateQueryBuilder();
        updateBuilder.setTableName(TableName.systemSetting);
        updateBuilder.addUpdateColumnNameWithValue(ColumnName.value, systemSettingNameWithValue.value);
        updateBuilder.addWhereParameterColumnNameWithValue(ColumnName.name, systemSettingNameWithValue.name);
        return {
            text: updateBuilder.getQueryString(),
            params: updateBuilder.getParameterValues(),
        };
    }

    public readonly getAllSystemSettingsQueryText = `
        SELECT
            name,
            type,
            description,
            value
        FROM system_setting
        ORDER BY name ASC
    `;

    public readonly getSystemSettingByNameQueryText = `
        SELECT
            name,
            type,
            description,
            value
        FROM system_setting
        WHERE name = $1
    `;
}

const enum TableName {
    systemSetting = 'system_setting',
}

const enum ColumnName {
    name = 'name',
    value = 'value',
}
