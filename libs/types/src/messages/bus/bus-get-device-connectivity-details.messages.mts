import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';
import { DeviceConnectivityConnectionEventItem } from '../shared-declarations/device-connectivity-types.mjs';

export interface BusGetDeviceConnectivityDetailsRequestMessageBody {
    deviceId: number;
}

export type BusGetDeviceConnectivityDetailsRequestMessage = Message<BusGetDeviceConnectivityDetailsRequestMessageBody>;

export function createBusGetDeviceConnectivityDetailsRequestMessage(): BusGetDeviceConnectivityDetailsRequestMessage {
    const msg: BusGetDeviceConnectivityDetailsRequestMessage = {
        header: { type: MessageType.busGetDeviceConnectivityDetailsRequest },
        body: {} as BusGetDeviceConnectivityDetailsRequestMessageBody,
    };
    return msg;
}


export interface BusGetDeviceConnectivityDetailsReplyMessageBody {
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

export type BusGetDeviceConnectivityDetailsReplyMessage = Message<BusGetDeviceConnectivityDetailsReplyMessageBody>;

export function createBusGetDeviceConnectivityDetailsReplyMessage(): BusGetDeviceConnectivityDetailsReplyMessage {
    const msg: BusGetDeviceConnectivityDetailsReplyMessage = {
        header: { type: MessageType.busGetDeviceConnectivityDetailsReply },
        body: {} as BusGetDeviceConnectivityDetailsReplyMessageBody,
    };
    return msg;
}