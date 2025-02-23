import { DeviceGroup } from 'src/entities/device-group.mjs';
import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';

export interface BusCreateDeviceGroupRequestMessageBody {
    deviceGroup: DeviceGroup;
    assignedTariffIds: number[];
}

export type BusCreateDeviceGroupRequestMessage = Message<BusCreateDeviceGroupRequestMessageBody>;

export function createBusCreateDeviceGroupRequestMessage(): BusCreateDeviceGroupRequestMessage {
    const msg: BusCreateDeviceGroupRequestMessage = {
        header: { type: MessageType.busCreateDeviceGroupRequest },
        body: {} as BusCreateDeviceGroupRequestMessageBody,
    };
    return msg;
}