import { DeviceGroup } from 'src/entities/device-group.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusUpdateDeviceGroupReplyMessageBody {
    deviceGroup: DeviceGroup;
}

export type BusUpdateDeviceGroupReplyMessage = Message<BusUpdateDeviceGroupReplyMessageBody>;

export function createBusUpdateDeviceGroupReplyMessage(): BusUpdateDeviceGroupReplyMessage {
    const msg: BusUpdateDeviceGroupReplyMessage = {
        header: { type: MessageType.busUpdateDeviceGroupReply },
        body: {} as BusUpdateDeviceGroupReplyMessageBody,
    };
    return msg
}