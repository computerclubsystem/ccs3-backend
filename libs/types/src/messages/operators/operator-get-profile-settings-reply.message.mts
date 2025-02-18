import { UserProfileSettingWithValue } from 'src/entities/user-profile-setting-with-value.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';

export interface OperatorGetProfileSettingsReplyMessageBody {
    username: string;
    settings: UserProfileSettingWithValue[];
}

export type OperatorGetProfileSettingsReplyMessage = OperatorReplyMessage<OperatorGetProfileSettingsReplyMessageBody>;

export function createOperatorGetProfileSettingsReplyMessage(): OperatorGetProfileSettingsReplyMessage {
    const msg: OperatorGetProfileSettingsReplyMessage = {
        header: { type: OperatorReplyMessageType.getProfileSettingsReply },
        body: {} as OperatorGetProfileSettingsReplyMessageBody,
    };
    return msg;
}