import { OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorGetDeviceStatusesRequestMessageBody {
    deviceId: number;
}

export interface OperatorGetDeviceStatusesRequestMessage extends OperatorRequestMessage<OperatorGetDeviceStatusesRequestMessageBody> {
}
