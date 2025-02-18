import { OperatorRequestMessage } from './declarations/operator.message.mjs';
import { UserProfileSettingWithValue } from 'src/entities/user-profile-setting-with-value.mjs';

export interface OperatorUpdateProfileSettingsRequestMessageBody {
    profileSettings: UserProfileSettingWithValue[];
}

export type OperatorUpdateProfileSettingsRequestMessage = OperatorRequestMessage<OperatorUpdateProfileSettingsRequestMessageBody>;
