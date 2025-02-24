import { DeviceGroup } from 'src/entities/device-group.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';

export interface OperatorUpdateDeviceGroupReplyMessageBody {
    deviceGroup: DeviceGroup;
}

export type OperatorUpdateDeviceGroupReplyMessage = OperatorReplyMessage<OperatorUpdateDeviceGroupReplyMessageBody>;

export function createOperatorUpdateDeviceGroupReplyMessage(): OperatorUpdateDeviceGroupReplyMessage {
    const msg: OperatorUpdateDeviceGroupReplyMessage = {
        header: { type: OperatorReplyMessageType.updateDeviceGroupReply },
        body: {} as OperatorUpdateDeviceGroupReplyMessageBody,
    };
    return msg
}