import { OperatorMessage } from './declarations/operator.message.mjs';

export interface OperatorGetDeviceByIdRequestMessageBody {
    deviceId: number;
}

export interface OperatorGetDeviceByIdRequestMessage extends OperatorMessage<OperatorGetDeviceByIdRequestMessageBody> {
}
