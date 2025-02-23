import { OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorGetDeviceGroupDataRequestMessageBody {
    deviceGroupId: number;
}

export type OperatorGetDeviceGroupDataRequestMessage = OperatorRequestMessage<OperatorGetDeviceGroupDataRequestMessageBody>;