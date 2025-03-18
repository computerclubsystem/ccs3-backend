import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorRestartDevicesRequestMessageBody {
    deviceIds: number[];
}

export type OperatorRestartDevicesRequestMessage = OperatorRequestMessage<OperatorRestartDevicesRequestMessageBody>;


export interface OperatorRestartDevicesReplyMessageBody {
    targetsCount: number;
};

export type OperatorRestartDevicesReplyMessage = OperatorReplyMessage<OperatorRestartDevicesReplyMessageBody>;

export function createOperatorRestartDevicesReplyMessage(): OperatorRestartDevicesReplyMessage {
    const msg: OperatorRestartDevicesReplyMessage = {
        header: { type: OperatorReplyMessageType.restartDevicesReply },
        body: {} as OperatorRestartDevicesReplyMessageBody,
    };
    return msg;
}