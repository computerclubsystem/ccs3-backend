import { DeviceGroup } from 'src/entities/device-group.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export type BusGetAllDeviceGroupsRequestMessageBody = object;

export type BusGetAllDeviceGroupsRequestMessage = Message<BusGetAllDeviceGroupsRequestMessageBody>;

export function createBusGetAllDeviceGroupsRequestMessage(): BusGetAllDeviceGroupsRequestMessage {
    const msg: BusGetAllDeviceGroupsRequestMessage = {
        header: { type: MessageType.busGetAllDeviceGroupsRequest },
        body: {},
    };
    return msg;
}


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