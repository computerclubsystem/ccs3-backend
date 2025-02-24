import { DeviceGroup } from 'src/entities/device-group.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusGetAllDeviceGroupsReplyMessageBody {
    deviceGroups: DeviceGroup[];
}

export type BusGetAllDeviceGroupsReplyMessage = Message<BusGetAllDeviceGroupsReplyMessageBody>;

export function createBusGetAllDeviceGroupsReplyMessage(): BusGetAllDeviceGroupsReplyMessage {
    const msg: BusGetAllDeviceGroupsReplyMessage = {
        header: { type: MessageType.busGetAllDeviceGroupsReply },
        body: {} as BusGetAllDeviceGroupsReplyMessageBody,
    };
    return msg;
}