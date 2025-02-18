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
}