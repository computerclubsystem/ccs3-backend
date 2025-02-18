import { IUserProfileSettingWithValue } from 'src/storage/entities/user-profile-setting-with-value.mjs';
import { IQueryTextWithParamsResult } from './query-with-params.mjs';

export class UserProfileQueryHelper {
    updateUserProfileSettingQueryData(userId: number, profileSetting: IUserProfileSettingWithValue): IQueryTextWithParamsResult {
        const params = [
            profileSetting.setting_value,
            profileSetting.setting_name,
            userId,
        ];
        return {
            text: this.updateUserProfileSettingQueryText,
            params: params,
        };
    }

    private readonly updateUserProfileSettingQueryText = `
        UPDATE user_profile
        SET setting_value = $1
        WHERE setting_name = $2 AND user_id = $3
    `;

    getUserProfileSettingWithValuesQueryData(userId: number): IQueryTextWithParamsResult {
        const params = [
            userId,
        ];
        return {
            text: this.getUserProfileSettingWithValuesQueryText,
            params: params,
        };
    }

    private readonly getUserProfileSettingWithValuesQueryText = `
        SELECT
            setting_name,
            setting_value
        FROM user_profile
        WHERE user_id = $1
    `;
}