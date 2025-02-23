import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export type BusGetAllDeviceGroupsRequestMessageBody = object;

export type BusGetAllDeviceGroupsRequestMessage = Message<BusGetAllDeviceGroupsRequestMessageBody>;

export function createBusGetAllDeviceGroupsRequestMessage(): BusGetAllDeviceGroupsRequestMessage {
    const msg: BusGetAllDeviceGroupsRequestMessage = {
        header: { type: MessageType.busGetAllDeviceGroupsRequest },
        body: {},
    };
    return msg;
}