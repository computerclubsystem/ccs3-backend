import { DeviceStatus } from '../bus/bus-device-statuses-notification.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorStartDeviceRequestMessageBody {
    deviceId: number;
    tariffId: number;
}

export type OperatorStartDeviceRequestMessage = OperatorRequestMessage<OperatorStartDeviceRequestMessageBody>;


export interface OperatorStartDeviceReplyMessageBody {
    deviceStatus?: DeviceStatus | null;
}

export type OperatorStartDeviceReplyMessage = OperatorReplyMessage<OperatorStartDeviceReplyMessageBody>;

export function createOperatorStartDeviceReplyMessage(): OperatorStartDeviceReplyMessage {
    const msg: OperatorStartDeviceReplyMessage = {
        header: { type: OperatorReplyMessageType.startDeviceReply },
        body: {} as OperatorStartDeviceReplyMessageBody,
    };
    return msg;
};

