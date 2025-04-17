import { DeviceConnectivityConnectionEventItem } from '../shared-declarations/device-connectivity-types.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorGetDeviceConnectivityDetailsRequestMessageBody {
    deviceId: number;
}

export type OperatorGetDeviceConnectivityDetailsRequestMessage = OperatorRequestMessage<OperatorGetDeviceConnectivityDetailsRequestMessageBody>;


export interface OperatorGetDeviceConnectivityDetailsReplyMessageBody {
    deviceId: number;
    receivedMessagesCount: number;
    sentMessagesCount: number;
    secondsSinceLastReceivedMessage?: number | null;
    secondsSinceLastSentMessage?: number | null;
    connectionsCount: number;
    isConnected: boolean;
    connectionEventItems: DeviceConnectivityConnectionEventItem[];
    secondsSinceLastConnection: number;
}

export type OperatorGetDeviceConnectivityDetailsReplyMessage = OperatorReplyMessage<OperatorGetDeviceConnectivityDetailsReplyMessageBody>;

export function createOperatorGetDeviceConnectivityDetailsReplyMessage(): OperatorGetDeviceConnectivityDetailsReplyMessage {
    const msg: OperatorGetDeviceConnectivityDetailsReplyMessage = {
        header: { type: OperatorReplyMessageType.getDeviceConnectivityDetailsReply },
        body: {} as OperatorGetDeviceConnectivityDetailsReplyMessageBody,
    };
    return msg;
}