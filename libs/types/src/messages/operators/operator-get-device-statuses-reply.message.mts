import { OperatorDeviceStatus } from 'src/entities/operator-device-status.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';

export interface OperatorGetDeviceStatusesReplyMessageBody {
    deviceStatuses: OperatorDeviceStatus[];
}

export interface OperatorGetDeviceStatusesReplyMessage extends OperatorReplyMessage<OperatorGetDeviceStatusesReplyMessageBody> {
}

export function createOperatorGetDeviceStatusesReplyMessage(): OperatorGetDeviceStatusesReplyMessage {
    const msg: OperatorGetDeviceStatusesReplyMessage = {
        header: { type: OperatorReplyMessageType.getDeviceStatusesReply },
        body: {} as OperatorGetDeviceStatusesReplyMessageBody,
    };
    return msg;
};
