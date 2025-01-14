import { DeviceStatus } from '../bus/bus-device-statuses.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';

export interface OperatorStopDeviceReplyMessageBody {
    deviceStatus?: DeviceStatus | null;
}

export interface OperatorStopDeviceReplyMessage extends OperatorReplyMessage<OperatorStopDeviceReplyMessageBody> {
}

export function createOperatorStopDeviceReplyMessage(): OperatorStopDeviceReplyMessage {
    const msg: OperatorStopDeviceReplyMessage = {
        header: { type: OperatorReplyMessageType.stopDeviceReply },
        body: {} as OperatorStopDeviceReplyMessageBody,
    };
    return msg;
};
