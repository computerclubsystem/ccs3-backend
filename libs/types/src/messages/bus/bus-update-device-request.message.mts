import { Device } from 'src/entities/device.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusUpdateDeviceRequestMessageBody {
    device: Device;
}

export interface BusUpdateDeviceRequestMessage extends Message<BusUpdateDeviceRequestMessageBody> {
}

export function createBusUpdateDeviceRequestMessage(): BusUpdateDeviceRequestMessage {
    const msg: BusUpdateDeviceRequestMessage = {
        header: { type: MessageType.busUpdateDeviceRequest },
        body: {} as BusUpdateDeviceRequestMessageBody,
    };
    return msg;
};