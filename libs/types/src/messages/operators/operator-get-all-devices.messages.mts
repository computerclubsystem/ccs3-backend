import { Device } from 'src/entities/device.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';

export type OperatorGetAllDevicesRequestMessageBody = object;

export type OperatorGetAllDevicesRequestMessage = OperatorRequestMessage<OperatorGetAllDevicesRequestMessageBody>;


export interface OperatorGetAllDevicesReplyMessageBody {
    devices: Device[];
}

export type OperatorGetAllDevicesReplyMessage = OperatorReplyMessage<OperatorGetAllDevicesReplyMessageBody>;

export function createOperatorGetAllDevicesReplyMessage(): OperatorGetAllDevicesReplyMessage {
    const msg: OperatorGetAllDevicesReplyMessage = {
        header: { type: OperatorReplyMessageType.getAllDevicesReply },
        body: {} as OperatorGetAllDevicesReplyMessageBody,
    };
    return msg;
};

