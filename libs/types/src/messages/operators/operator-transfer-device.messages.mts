import { DeviceStatus } from '../bus/bus-device-statuses-notification.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorTransferDeviceRequestMessageBody {
    sourceDeviceId: number;
    targetDeviceId: number;
    transferNote?: boolean | null;
}

export type OperatorTransferDeviceRequestMessage = OperatorRequestMessage<OperatorTransferDeviceRequestMessageBody>;


export interface OperatorTransferDeviceReplyMessageBody {
    sourceDeviceStatus?: DeviceStatus | null;
    targetDeviceStatus?: DeviceStatus | null;
}

export type OperatorTransferDeviceReplyMessage = OperatorReplyMessage<OperatorTransferDeviceReplyMessageBody>;

export function createOperatorTransferDeviceReplyMessage(): OperatorTransferDeviceReplyMessage {
    const msg: OperatorTransferDeviceReplyMessage = {
        header: { type: OperatorReplyMessageType.transferDeviceReply },
        body: {} as OperatorTransferDeviceReplyMessageBody,
    };
    return msg;
};
