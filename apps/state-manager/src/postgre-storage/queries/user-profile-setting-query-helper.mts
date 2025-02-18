import { IQueryTextWithParamsResult } from './query-with-params.mjs';

export class UserProfileSettingQueryHelper {
    getAllUserProfileSettingsQueryData(): IQueryTextWithParamsResult {
        return {
            text: this.getAllUserProfileSettingsQueryText,
            params: [],
        };
    }

    private readonly getAllUserProfileSettingsQueryText = `
        SELECT
            name,
            description
        FROM user_profile_setting
    `;
}