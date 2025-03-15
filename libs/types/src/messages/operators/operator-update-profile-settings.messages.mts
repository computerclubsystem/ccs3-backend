import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';
import { UserProfileSettingWithValue } from 'src/entities/user-profile-setting-with-value.mjs';

export interface OperatorUpdateProfileSettingsRequestMessageBody {
    profileSettings: UserProfileSettingWithValue[];
}

export type OperatorUpdateProfileSettingsRequestMessage = OperatorRequestMessage<OperatorUpdateProfileSettingsRequestMessageBody>;


export type OperatorUpdateProfileSettingsReplyMessageBody = object;

export type OperatorUpdateProfileSettingsReplyMessage = OperatorReplyMessage<OperatorUpdateProfileSettingsReplyMessageBody>;

export function createOperatorUpdateProfileSettingsReplyMessage(): OperatorUpdateProfileSettingsReplyMessage {
    const msg: OperatorUpdateProfileSettingsReplyMessage = {
        header: { type: OperatorReplyMessageType.updateProfileSettingsReply },
        body: {},
    };
    return msg;
};