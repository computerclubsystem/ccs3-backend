import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';
import { DeviceContinuation } from 'src/entities/device-continuation.mjs';

export interface BusCreateDeviceContinuationRequestMessageBody {
    deviceContinuation: DeviceContinuation;
}

export interface BusCreateDeviceContinuationRequestMessage extends Message<BusCreateDeviceContinuationRequestMessageBody> {
}

export function createBusCreateDeviceContinuationRequestMessage(): BusCreateDeviceContinuationRequestMessage {
    const msg: BusCreateDeviceContinuationRequestMessage = {
        header: { type: MessageType.busCreateDeviceContinuationRequest },
        body: {} as BusCreateDeviceContinuationRequestMessageBody,
    };
    return msg;
};
