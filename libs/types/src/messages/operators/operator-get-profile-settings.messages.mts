import { UserProfileSettingWithValue } from 'src/entities/user-profile-setting-with-value.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';

export type OperatorGetProfileSettingsRequestMessageBody = object;

export type OperatorGetProfileSettingsRequestMessage = OperatorRequestMessage<OperatorGetProfileSettingsRequestMessageBody>;


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
};