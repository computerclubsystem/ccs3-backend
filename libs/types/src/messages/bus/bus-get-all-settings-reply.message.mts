import { SystemSetting } from 'src/entities/system-setting.mjs';
import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';

export interface SBusGetAllSettingsReplyMessageBody {
    systemSettings: SystemSetting[];
}

export type SBusGetAllSettingsReplyMessage = Message<SBusGetAllSettingsReplyMessageBody>;

export function createBusGetAllSettingsReplyMessage(): SBusGetAllSettingsReplyMessage {
    const msg: SBusGetAllSettingsReplyMessage = {
        header: { type: MessageType.busGetAllSystemSettingsReply },
        body: {} as SBusGetAllSettingsReplyMessageBody,
    };
    return msg;
}