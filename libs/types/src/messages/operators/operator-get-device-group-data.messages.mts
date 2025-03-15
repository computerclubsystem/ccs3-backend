import { DeviceGroupData } from 'src/entities/device-group-data.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';

export interface OperatorGetDeviceGroupDataRequestMessageBody {
    deviceGroupId: number;
}

export type OperatorGetDeviceGroupDataRequestMessage = OperatorRequestMessage<OperatorGetDeviceGroupDataRequestMessageBody>;


export interface OperatorGetDeviceGroupDataReplyMessageBody {
    deviceGroupData: DeviceGroupData;
}

export type OperatorGetDeviceGroupDataReplyMessage = OperatorReplyMessage<OperatorGetDeviceGroupDataReplyMessageBody>;

export function createOperatorGetDeviceGroupDataReplyMessage(): OperatorGetDeviceGroupDataReplyMessage {
    const msg: OperatorGetDeviceGroupDataReplyMessage = {
        header: { type: OperatorReplyMessageType.getDeviceGroupDataReply },
        body: {} as OperatorGetDeviceGroupDataReplyMessageBody,
    };
    return msg;
};