import { SystemSetting } from 'src/entities/system-setting.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export type BusGetAllSystemSettingsRequestMessageBody = object;

export type BusGetAllSystemSettingsRequestMessage = Message<BusGetAllSystemSettingsRequestMessageBody>;

export function createBusGetAllSystemSettingsRequestMessage(): BusGetAllSystemSettingsRequestMessage {
    const msg: BusGetAllSystemSettingsRequestMessage = {
        header: { type: MessageType.busGetAllSystemSettingsRequest },
        body: {} as BusGetAllSystemSettingsRequestMessageBody,
    };
    return msg;
};


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
};