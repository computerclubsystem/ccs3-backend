import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export type BusGetAllAllowedDeviceObjectsRequestMessageBody = object;

export type BusGetAllAllowedDeviceObjectsRequestMessage = Message<BusGetAllAllowedDeviceObjectsRequestMessageBody>;

export function createBusGetAllAllowedDeviceObjectsRequestMessage(): BusGetAllAllowedDeviceObjectsRequestMessage {
    const msg: BusGetAllAllowedDeviceObjectsRequestMessage = {
        header: { type: MessageType.busGetAllAllowedDeviceObjectsRequest },
        body: {},
    };
    return msg;
}