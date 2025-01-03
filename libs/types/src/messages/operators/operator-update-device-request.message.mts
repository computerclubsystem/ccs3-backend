import { Device } from 'src/entities/device.mjs';
import { OperatorMessage } from './declarations/operator.message.mjs';

export interface OperatorUpdateDeviceRequestMessageBody {
    device: Device;
}

export interface OperatorUpdateDeviceRequestMessage extends OperatorMessage<OperatorUpdateDeviceRequestMessageBody> {
}
