import { OperatorRequestMessage } from './declarations/operator.message.mjs';
import { DeviceContinuation } from 'src/entities/device-continuation.mjs';

export interface OperatorCreateDeviceContinuationRequestMessageBody {
    deviceContinuation: DeviceContinuation;
}

export interface OperatorCreateDeviceContinuationRequestMessage extends OperatorRequestMessage<OperatorCreateDeviceContinuationRequestMessageBody> {
}
