import { OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorTransferDeviceRequestMessageBody {
    sourceDeviceId: number;
    targetDeviceId: number;
    transferNote?: boolean | null;
}

export interface OperatorTransferDeviceRequestMessage extends OperatorRequestMessage<OperatorTransferDeviceRequestMessageBody> {
}