import { DeviceGroup } from 'src/entities/device-group.mjs';
import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';

export interface BusUpdateDeviceGroupRequestMessageBody {
    deviceGroup: DeviceGroup;
    assignedTariffIds?: number[] | null;
}

export type BusUpdateDeviceGroupRequestMessage = Message<BusUpdateDeviceGroupRequestMessageBody>;

export function createBusUpdateDeviceGroupRequestMessage(): BusUpdateDeviceGroupRequestMessage {
    const msg: BusUpdateDeviceGroupRequestMessage = {
        header: { type: MessageType.busUpdateDeviceGroupRequest },
        body: {} as BusUpdateDeviceGroupRequestMessageBody,
    };
    return msg;
};


export interface BusUpdateDeviceGroupReplyMessageBody {
    deviceGroup: DeviceGroup;
}

export type BusUpdateDeviceGroupReplyMessage = Message<BusUpdateDeviceGroupReplyMessageBody>;

export function createBusUpdateDeviceGroupReplyMessage(): BusUpdateDeviceGroupReplyMessage {
    const msg: BusUpdateDeviceGroupReplyMessage = {
        header: { type: MessageType.busUpdateDeviceGroupReply },
        body: {} as BusUpdateDeviceGroupReplyMessageBody,
    };
    return msg;
};