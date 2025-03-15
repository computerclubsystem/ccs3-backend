import { DeviceStatus } from '../bus/bus-device-statuses-notification.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorStopDeviceRequestMessageBody {
    deviceId: number;
    note?: string | null;
}

export type OperatorStopDeviceRequestMessage = OperatorRequestMessage<OperatorStopDeviceRequestMessageBody>;


export interface OperatorStopDeviceReplyMessageBody {
    deviceStatus?: DeviceStatus | null;
}

export type OperatorStopDeviceReplyMessage = OperatorReplyMessage<OperatorStopDeviceReplyMessageBody>;

export function createOperatorStopDeviceReplyMessage(): OperatorStopDeviceReplyMessage {
    const msg: OperatorStopDeviceReplyMessage = {
        header: { type: OperatorReplyMessageType.stopDeviceReply },
        body: {} as OperatorStopDeviceReplyMessageBody,
    };
    return msg;
};

