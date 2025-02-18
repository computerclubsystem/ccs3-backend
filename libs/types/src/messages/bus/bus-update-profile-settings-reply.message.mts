import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export type BusUpdateProfileSettingsReplyMessageBody = object;

export type BusUpdateProfileSettingsReplyMessage = Message<BusUpdateProfileSettingsReplyMessageBody>;

export function createBusUpdateProfileSettingsReplyMessage(): BusUpdateProfileSettingsReplyMessage {
    const msg: BusUpdateProfileSettingsReplyMessage = {
        header: { type: MessageType.busUpdateProfileSettingsReply },
        body: {},
    };
    return msg;
}