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
}