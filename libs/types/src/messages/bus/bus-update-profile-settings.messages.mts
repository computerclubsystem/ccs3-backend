import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { UserProfileSettingWithValue } from 'src/entities/user-profile-setting-with-value.mjs';

export interface BusUpdateProfileSettingsRequestMessageBody {
    userId: number;
    profileSettings: UserProfileSettingWithValue[];
}

export type BusUpdateProfileSettingsRequestMessage = Message<BusUpdateProfileSettingsRequestMessageBody>;

export function createBusUpdateProfileSettingsRequestMessage(): BusUpdateProfileSettingsRequestMessage {
    const msg: BusUpdateProfileSettingsRequestMessage = {
        header: { type: MessageType.busUpdateProfileSettingsRequest },
        body: {} as BusUpdateProfileSettingsRequestMessageBody,
    };
    return msg;
};


export type BusUpdateProfileSettingsReplyMessageBody = object;

export type BusUpdateProfileSettingsReplyMessage = Message<BusUpdateProfileSettingsReplyMessageBody>;

export function createBusUpdateProfileSettingsReplyMessage(): BusUpdateProfileSettingsReplyMessage {
    const msg: BusUpdateProfileSettingsReplyMessage = {
        header: { type: MessageType.busUpdateProfileSettingsReply },
        body: {},
    };
    return msg;
};