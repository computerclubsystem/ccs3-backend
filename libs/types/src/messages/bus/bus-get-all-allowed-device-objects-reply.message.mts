import { AllowedDeviceObjects } from 'src/entities/allowed-device-objects.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusGetAllAllowedDeviceObjectsReplyMessageBody {
    allowedDeviceObjects: AllowedDeviceObjects[];
}

export type BusGetAllAllowedDeviceObjectsReplyMessage = Message<BusGetAllAllowedDeviceObjectsReplyMessageBody>;

export function createBusGetAllAllowedDeviceObjectsReplyMessage(): BusGetAllAllowedDeviceObjectsReplyMessage {
    const msg: BusGetAllAllowedDeviceObjectsReplyMessage = {
        header: { type: MessageType.busGetAllAllowedDeviceObjectsReply },
        body: {} as BusGetAllAllowedDeviceObjectsReplyMessageBody,
    };
    return msg;
}