import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export type BusGetAllSettingsRequestMessageBody = object;

export type BusGetAllSettingsRequestMessage = Message<BusGetAllSettingsRequestMessageBody>;

export function createBusGetAllSettingsRequestMessage(): BusGetAllSettingsRequestMessage {
    const msg: BusGetAllSettingsRequestMessage = {
        header: { type: MessageType.busGetAllSystemSettingsRequest },
        body: {} as BusGetAllSettingsRequestMessageBody,
    };
    return msg;
}