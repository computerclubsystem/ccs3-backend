import { UserProfileSettingWithValue } from 'src/entities/user-profile-setting-with-value.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusGetProfileSettingsReplyMessageBody {
    username: string;
    settings: UserProfileSettingWithValue[];
}

export type BusGetProfileSettingsReplyMessage = Message<BusGetProfileSettingsReplyMessageBody>;

export function createBusGetProfileSettingsReplyMessage(): BusGetProfileSettingsReplyMessage {
    const msg: BusGetProfileSettingsReplyMessage = {
        header: { type: MessageType.busGetProfileSettingsReply },
        body: {} as BusGetProfileSettingsReplyMessageBody,
    };
    return msg;
}