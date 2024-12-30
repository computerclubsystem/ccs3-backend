import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';
import { OperatorMessage } from '../operators/declarations/operator.message.mjs';
import { transferSharedMessageDataToReplyOperatorMessage } from '../utils.mjs';

export interface BusOperatorGetAllDevicesRequestMessageBody {
}

export interface BusOperatorGetAllDevicesRequestMessage extends Message<BusOperatorGetAllDevicesRequestMessageBody> {
}

export function createBusOperatorGetAllDevicesRequestMessage<TBody>(sourceMessage?: OperatorMessage<TBody> | null): BusOperatorGetAllDevicesRequestMessage {
    const msg: BusOperatorGetAllDevicesRequestMessage = {
        header: { type: MessageType.busOperatorGetAllDevicesRequest },
        body: {} as BusOperatorGetAllDevicesRequestMessageBody,
    };
    transferSharedMessageDataToReplyOperatorMessage(msg, sourceMessage);
    return msg;
};