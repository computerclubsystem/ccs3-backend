import { Device } from 'src/entities/device.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';

export interface OperatorUpdateDeviceRequestMessageBody {
    device: Device;
}

export type OperatorUpdateDeviceRequestMessage = OperatorRequestMessage<OperatorUpdateDeviceRequestMessageBody>;


export interface OperatorUpdateDeviceReplyMessageBody {
    device?: Device;
}

export type OperatorUpdateDeviceReplyMessage = OperatorReplyMessage<OperatorUpdateDeviceReplyMessageBody>;

export function createOperatorUpdateDeviceReplyMessage(): OperatorUpdateDeviceReplyMessage {
    const msg: OperatorUpdateDeviceReplyMessage = {
        header: { type: OperatorReplyMessageType.updateDeviceReply },
        body: {} as OperatorUpdateDeviceReplyMessageBody,
    };
    return msg;
};

