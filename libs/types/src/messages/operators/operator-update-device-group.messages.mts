import { DeviceGroup } from 'src/entities/device-group.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';

export interface OperatorUpdateDeviceGroupRequestMessageBody {
    deviceGroup: DeviceGroup;
    assignedTariffIds?: number[] | null;
}

export type OperatorUpdateDeviceGroupRequestMessage = OperatorRequestMessage<OperatorUpdateDeviceGroupRequestMessageBody>;


export interface OperatorUpdateDeviceGroupReplyMessageBody {
    deviceGroup: DeviceGroup;
}

export type OperatorUpdateDeviceGroupReplyMessage = OperatorReplyMessage<OperatorUpdateDeviceGroupReplyMessageBody>;

export function createOperatorUpdateDeviceGroupReplyMessage(): OperatorUpdateDeviceGroupReplyMessage {
    const msg: OperatorUpdateDeviceGroupReplyMessage = {
        header: { type: OperatorReplyMessageType.updateDeviceGroupReply },
        body: {} as OperatorUpdateDeviceGroupReplyMessageBody,
    };
    return msg;
};