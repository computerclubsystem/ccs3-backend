import { OperatorMessage } from './declarations/operator.message.mjs';
import { DeviceContinuation } from 'src/entities/device-continuation.mjs';

export interface OperatorCreateDeviceContinuationRequestMessageBody {
    deviceContinuation: DeviceContinuation;
}

export interface OperatorCreateDeviceContinuationRequestMessage extends OperatorMessage<OperatorCreateDeviceContinuationRequestMessageBody> {
}
