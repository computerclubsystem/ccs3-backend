import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorShutdownDevicesRequestMessageBody {
    deviceIds: number[];
}

export type OperatorShutdownDevicesRequestMessage = OperatorRequestMessage<OperatorShutdownDevicesRequestMessageBody>;


export interface OperatorShutdownDevicesReplyMessageBody {
    targetsCount: number;
};

export type OperatorShutdownDevicesReplyMessage = OperatorReplyMessage<OperatorShutdownDevicesReplyMessageBody>;

export function createOperatorShutdownDevicesReplyMessage(): OperatorShutdownDevicesReplyMessage {
    const msg: OperatorShutdownDevicesReplyMessage = {
        header: { type: OperatorReplyMessageType.shutdownDevicesReply },
        body: {} as OperatorShutdownDevicesReplyMessageBody,
    };
    return msg;
}