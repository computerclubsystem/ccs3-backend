import { DeviceGroup } from 'src/entities/device-group.mjs';
import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';

export interface BusCreateDeviceGroupReplyMessageBody {
    deviceGroup: DeviceGroup;
}

export type BusCreateDeviceGroupReplyMessage = Message<BusCreateDeviceGroupReplyMessageBody>;

export function createBusCreateDeviceGroupReplyMessage(): BusCreateDeviceGroupReplyMessage {
    const msg: BusCreateDeviceGroupReplyMessage = {
        header: { type: MessageType.busCreateDeviceGroupReply },
        body: {} as BusCreateDeviceGroupReplyMessageBody,
    };
    return msg;
}