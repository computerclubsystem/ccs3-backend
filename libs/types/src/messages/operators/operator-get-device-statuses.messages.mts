import { OperatorDeviceStatus } from 'src/entities/operator-device-status.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';

export interface OperatorGetDeviceStatusesRequestMessageBody {
    deviceId: number;
}

export type OperatorGetDeviceStatusesRequestMessage = OperatorRequestMessage<OperatorGetDeviceStatusesRequestMessageBody>;


export interface OperatorGetDeviceStatusesReplyMessageBody {
    deviceStatuses: OperatorDeviceStatus[];
}

export type OperatorGetDeviceStatusesReplyMessage = OperatorReplyMessage<OperatorGetDeviceStatusesReplyMessageBody>;

export function createOperatorGetDeviceStatusesReplyMessage(): OperatorGetDeviceStatusesReplyMessage {
    const msg: OperatorGetDeviceStatusesReplyMessage = {
        header: { type: OperatorReplyMessageType.getDeviceStatusesReply },
        body: {} as OperatorGetDeviceStatusesReplyMessageBody,
    };
    return msg;
};

