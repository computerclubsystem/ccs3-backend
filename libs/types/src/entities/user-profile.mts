import { UserProfileSettingWithValue } from './user-profile-setting-with-value.mjs';

export interface UserProfile {
    user_id: number;
    username: string;
    settings: UserProfileSettingWithValue[];
}