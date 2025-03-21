import { DeviceGroupData } from 'src/entities/device-group-data.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusGetDeviceGroupDataRequestMessageBody {
    deviceGroupId: number;
}

export type BusGetDeviceGroupDataRequestMessage = Message<BusGetDeviceGroupDataRequestMessageBody>;

export function createBusGetDeviceGroupDataRequestMessage(): BusGetDeviceGroupDataRequestMessage {
    const msg: BusGetDeviceGroupDataRequestMessage = {
        header: { type: MessageType.busGetDeviceGroupDataRequest },
        body: {} as BusGetDeviceGroupDataRequestMessageBody,
    };
    return msg;
};


export interface BusGetDeviceGroupDataReplyMessageBody {
    deviceGroupData: DeviceGroupData;
}

export type BusGetDeviceGroupDataReplyMessage = Message<BusGetDeviceGroupDataReplyMessageBody>;

export function createBusGetDeviceGroupDataReplyMessage(): BusGetDeviceGroupDataReplyMessage {
    const msg: BusGetDeviceGroupDataReplyMessage = {
        header: { type: MessageType.busGetDeviceGroupDataReply },
        body: {} as BusGetDeviceGroupDataReplyMessageBody,
    };
    return msg;
}