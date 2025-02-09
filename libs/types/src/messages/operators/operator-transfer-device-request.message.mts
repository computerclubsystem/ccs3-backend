import { OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorTransferDeviceRequestMessageBody {
    sourceDeviceId: number;
    targetDeviceId: number;
}

export interface OperatorTransferDeviceRequestMessage extends OperatorRequestMessage<OperatorTransferDeviceRequestMessageBody> {
}