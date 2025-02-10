import { SystemSetting } from 'src/entities/system-setting.mjs';
import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';

export interface BusGetAllSystemSettingsReplyMessageBody {
    systemSettings: SystemSetting[];
}

export type BusGetAllSystemSettingsReplyMessage = Message<BusGetAllSystemSettingsReplyMessageBody>;

export function createBusGetAllSystemSettingsReplyMessage(): BusGetAllSystemSettingsReplyMessage {
    const msg: BusGetAllSystemSettingsReplyMessage = {
        header: { type: MessageType.busGetAllSystemSettingsReply },
        body: {} as BusGetAllSystemSettingsReplyMessageBody,
    };
    return msg;
}