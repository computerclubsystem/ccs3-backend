import { Device } from 'src/entities/device.mjs';
import { OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorUpdateDeviceRequestMessageBody {
    device: Device;
}

export interface OperatorUpdateDeviceRequestMessage extends OperatorRequestMessage<OperatorUpdateDeviceRequestMessageBody> {
}
