import { DeviceStatus } from '../bus/bus-device-statuses.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';

export interface OperatorTransferDeviceReplyMessageBody {
    sourceDeviceStatus?: DeviceStatus | null;
    targetDeviceStatus?: DeviceStatus | null;
}

export interface OperatorTransferDeviceReplyMessage extends OperatorReplyMessage<OperatorTransferDeviceReplyMessageBody> {
}

export function createOperatorTransferDeviceReplyMessage(): OperatorTransferDeviceReplyMessage {
    const msg: OperatorTransferDeviceReplyMessage = {
        header: { type: OperatorReplyMessageType.transferDeviceReply },
        body: {} as OperatorTransferDeviceReplyMessageBody,
    };
    return msg;
};
