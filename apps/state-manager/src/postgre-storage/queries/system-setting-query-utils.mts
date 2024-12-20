export class SystemSettingQueryUtils {
    public readonly getAllSystemSettingsQueryText = `
        SELECT
            name,
            type,
            description,
            value
        FROM system_setting
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
