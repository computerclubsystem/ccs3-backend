import { OperatorMessage } from './declarations/operator.message.mjs';

export interface OperatorDeleteDeviceContinuationRequestMessageBody {
    deviceId: number;
}

export interface OperatorDeleteDeviceContinuationRequestMessage extends OperatorMessage<OperatorDeleteDeviceContinuationRequestMessageBody> {
}
