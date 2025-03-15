import { UserProfileSettingWithValue } from 'src/entities/user-profile-setting-with-value.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusGetProfileSettingsRequestMessageBody {
    userId: number;
};

export type BusGetProfileSettingsRequestMessage = Message<BusGetProfileSettingsRequestMessageBody>;

export function createBusGetProfileSettingsRequestMessage(): BusGetProfileSettingsRequestMessage {
    const msg: BusGetProfileSettingsRequestMessage = {
        header: { type: MessageType.busGetProfileSettingsRequest },
        body: {} as BusGetProfileSettingsRequestMessageBody,
    };
    return msg;
};


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