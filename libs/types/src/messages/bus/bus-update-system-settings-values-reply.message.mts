import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export type BusUpdateSystemSettingsValuesReplyMessageBody = object;

export type BusUpdateSystemSettingsValuesReplyMessage = Message<BusUpdateSystemSettingsValuesReplyMessageBody>;

export function createBusUpdateSystemSettingsValuesReplyMessage(): BusUpdateSystemSettingsValuesReplyMessage {
    const msg: BusUpdateSystemSettingsValuesReplyMessage = {
        header: { type: MessageType.busUpdateSystemSettingsValuesReply },
        body: {},
    };
    return msg;
}