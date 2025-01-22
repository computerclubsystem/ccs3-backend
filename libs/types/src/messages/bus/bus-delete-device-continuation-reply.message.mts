import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';

export interface BusDeleteDeviceContinuationReplyMessageBody {
    // TODO: Return updated DeviceStatus
}

export interface BusDeleteDeviceContinuationReplyMessage extends Message<BusDeleteDeviceContinuationReplyMessageBody> {
}

export function createBusDeleteDeviceContinuationReplyMessage(): BusDeleteDeviceContinuationReplyMessage {
    const msg: BusDeleteDeviceContinuationReplyMessage = {
        header: { type: MessageType.busDeleteDeviceContinuationReply },
        body: {} as BusDeleteDeviceContinuationReplyMessageBody,
    };
    return msg;
};
