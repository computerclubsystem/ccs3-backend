import { Device } from 'src/entities/device.mjs';
import { OperatorRequestMessageType } from './declarations/operator-message-type.mjs';
import { OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorCreateDeviceRequestMessageBody {
    device: Device;
}

export type OperatorCreateDeviceRequestMessage = OperatorRequestMessage<OperatorCreateDeviceRequestMessageBody>;

export function createOperatorCreateDeviceRequestMessage(): OperatorCreateDeviceRequestMessage {
    const msg: OperatorCreateDeviceRequestMessage = {
        header: { type: OperatorRequestMessageType.createDeviceRequest },
        body: {} as OperatorCreateDeviceRequestMessageBody,
    };
    return msg;
}