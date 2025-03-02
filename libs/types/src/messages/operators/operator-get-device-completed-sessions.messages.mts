import { DeviceSession } from 'src/entities/device-session.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorGetDeviceCompletedSessionsRequestMessageBody {
    fromDate: string;
    toDate: string;
    deviceId?: number | null;
    userId?: number | null;
    tariffId?: number | null;
}

export type OperatorGetDeviceCompletedSessionsRequestMessage = OperatorRequestMessage<OperatorGetDeviceCompletedSessionsRequestMessageBody>;


export interface OperatorGetDeviceCompletedSessionsReplyMessageBody {
    deviceSessions: DeviceSession[];
    totalSum: number;
}


export type OperatorGetDeviceCompletedSessionsReplyMessage = OperatorReplyMessage<OperatorGetDeviceCompletedSessionsReplyMessageBody>;

export function createOperatorGetDeviceCompletedSessionsReplyMessage(): OperatorGetDeviceCompletedSessionsReplyMessage {
    const msg: OperatorGetDeviceCompletedSessionsReplyMessage = {
        header: { type: OperatorReplyMessageType.getDeviceCompletedSessionsReply },
        body: {} as OperatorGetDeviceCompletedSessionsReplyMessageBody
    };
    return msg;
}