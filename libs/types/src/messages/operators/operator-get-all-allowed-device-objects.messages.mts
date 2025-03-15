import { AllowedDeviceObjects } from 'src/entities/allowed-device-objects.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';

export type OperatorGetAllAllowedDeviceObjectsRequestMessageBody = object;

export type OperatorGetAllAllowedDeviceObjectsRequestMessage = OperatorRequestMessage<OperatorGetAllAllowedDeviceObjectsRequestMessageBody>;


export interface OperatorGetAllAllowedDeviceObjectsReplyMessageBody {
    allowedDeviceObjects: AllowedDeviceObjects[];
}

export type OperatorGetAllAllowedDeviceObjectsReplyMessage = OperatorReplyMessage<OperatorGetAllAllowedDeviceObjectsReplyMessageBody>;

export function createOperatorGetAllAllowedDeviceObjectsReplyMessage(): OperatorGetAllAllowedDeviceObjectsReplyMessage {
    const msg: OperatorGetAllAllowedDeviceObjectsReplyMessage = {
        header: { type: OperatorReplyMessageType.getAllAllowedDeviceObjectsReply },
        body: {} as OperatorGetAllAllowedDeviceObjectsReplyMessageBody,
    };
    return msg;
};