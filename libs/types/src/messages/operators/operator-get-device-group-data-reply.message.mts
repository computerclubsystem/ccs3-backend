import { DeviceGroupData } from 'src/entities/device-group-data.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';

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
}