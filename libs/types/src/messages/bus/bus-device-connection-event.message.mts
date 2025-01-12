import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { DeviceConnectionEventType } from '../../entities/declarations/device-connection-event-type.mjs';

export interface BusDeviceConnectionEventMessageBody {
    deviceId: number;
    ipAddress: string;
    type: DeviceConnectionEventType;
    note?: string;
}

export interface BusDeviceConnectionEventMessage extends Message<BusDeviceConnectionEventMessageBody> {
}

export function createBusDeviceConnectionEventMessage(): BusDeviceConnectionEventMessage {
    const msg: BusDeviceConnectionEventMessage = {
        header: { type: MessageType.busDeviceConnectionEvent },
        body: {} as BusDeviceConnectionEventMessageBody,
    };
    return msg;
};