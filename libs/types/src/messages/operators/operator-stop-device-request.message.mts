import { OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorStopDeviceRequestMessageBody {
    deviceId: number;
    note?: string | null;
}

export interface OperatorStopDeviceRequestMessage extends OperatorRequestMessage<OperatorStopDeviceRequestMessageBody> {
}
