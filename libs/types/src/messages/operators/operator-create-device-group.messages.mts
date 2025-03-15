import { DeviceGroup } from 'src/entities/device-group.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';

export interface OperatorCreateDeviceGroupRequestMessageBody {
    deviceGroup: DeviceGroup;
    assignedTariffIds: number[];
}

export type OperatorCreateDeviceGroupRequestMessage = OperatorRequestMessage<OperatorCreateDeviceGroupRequestMessageBody>;


export interface OperatorCreateDeviceGroupReplyMessageBody {
    deviceGroup: DeviceGroup;
}

export type OperatorCreateDeviceGroupReplyMessage = OperatorReplyMessage<OperatorCreateDeviceGroupReplyMessageBody>;

export function createOperatorCreateDeviceGroupReplyMessage(): OperatorCreateDeviceGroupReplyMessage {
    const msg: OperatorCreateDeviceGroupReplyMessage = {
        header: { type: OperatorReplyMessageType.createDeviceGroupReply },
        body: {} as OperatorCreateDeviceGroupReplyMessageBody,
    };
    return msg;
};