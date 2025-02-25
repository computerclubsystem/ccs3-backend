import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorSetDeviceStatusNoteRequestMessageBody {
    deviceId: number;
    note: string | null;
}

export type OperatorSetDeviceStatusNoteRequestMessage = OperatorRequestMessage<OperatorSetDeviceStatusNoteRequestMessageBody>;


export type OperatorSetDeviceStatusNoteReplyMessageBody = object;

export type OperatorSetDeviceStatusNoteReplyMessage = OperatorReplyMessage<OperatorSetDeviceStatusNoteReplyMessageBody>;

export function createOperatorSetDeviceStatusNoteReplyMessage(): OperatorSetDeviceStatusNoteReplyMessage {
    const msg: OperatorSetDeviceStatusNoteReplyMessage = {
        header: { type: OperatorReplyMessageType.setDeviceStatusNoteReply },
        body: {},
    };
    return msg;
}