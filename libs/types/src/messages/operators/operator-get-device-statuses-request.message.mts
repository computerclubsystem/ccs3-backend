import { OperatorMessage } from './declarations/operator.message.mjs';

export interface OperatorGetDeviceStatusesRequestMessageBody {
    deviceId: number;
}

export interface OperatorGetDeviceStatusesRequestMessage extends OperatorMessage<OperatorGetDeviceStatusesRequestMessageBody> {
}
