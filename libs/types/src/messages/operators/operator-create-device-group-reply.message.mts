import { DeviceGroup } from 'src/entities/device-group.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';

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
}