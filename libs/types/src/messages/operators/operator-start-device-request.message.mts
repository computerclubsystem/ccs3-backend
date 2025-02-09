import { OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorStartDeviceRequestMessageBody {
    deviceId: number;
    tariffId: number;
}

export interface OperatorStartDeviceRequestMessage extends OperatorRequestMessage<OperatorStartDeviceRequestMessageBody> {
}
