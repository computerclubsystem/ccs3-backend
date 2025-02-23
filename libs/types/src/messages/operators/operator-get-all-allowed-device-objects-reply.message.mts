import { AllowedDeviceObjects } from 'src/entities/allowed-device-objects.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';

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
}