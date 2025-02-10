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
}