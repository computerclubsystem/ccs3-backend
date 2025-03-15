import { DeviceGroup } from 'src/entities/device-group.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';

export type OperatorGetAllDeviceGroupsRequestMessageBody = object;

export type OperatorGetAllDeviceGroupsRequestMessage = OperatorRequestMessage<OperatorGetAllDeviceGroupsRequestMessageBody>;


export interface OperatorGetAllDeviceGroupsReplyMessageBody {
    deviceGroups: DeviceGroup[];
}

export type OperatorGetAllDeviceGroupsReplyMessage = OperatorReplyMessage<OperatorGetAllDeviceGroupsReplyMessageBody>;

export function createOperatorGetAllDeviceGroupsReplyMessage(): OperatorGetAllDeviceGroupsReplyMessage {
    const msg: OperatorGetAllDeviceGroupsReplyMessage = {
        header: { type: OperatorReplyMessageType.getAllDeviceGroupsReply },
        body: {} as OperatorGetAllDeviceGroupsReplyMessageBody,
    };
    return msg;
};