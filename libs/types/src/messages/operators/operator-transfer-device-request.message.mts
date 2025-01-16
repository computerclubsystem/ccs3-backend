import { OperatorMessage } from './declarations/operator.message.mjs';

export interface OperatorTransferDeviceRequestMessageBody {
    sourceDeviceId: number;
    targetDeviceId: number;
}

export interface OperatorTransferDeviceRequestMessage extends OperatorMessage<OperatorTransferDeviceRequestMessageBody> {
}