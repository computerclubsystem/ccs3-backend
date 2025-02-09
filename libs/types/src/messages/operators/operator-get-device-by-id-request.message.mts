import { OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorGetDeviceByIdRequestMessageBody {
    deviceId: number;
}

export interface OperatorGetDeviceByIdRequestMessage extends OperatorRequestMessage<OperatorGetDeviceByIdRequestMessageBody> {
}
