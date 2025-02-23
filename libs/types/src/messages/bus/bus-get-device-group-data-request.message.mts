import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusGetDeviceGroupDataRequestMessageBody {
    deviceGroupId: number;
}

export type BusGetDeviceGroupDataRequestMessage = Message<BusGetDeviceGroupDataRequestMessageBody>;

export function createBusGetDeviceGroupDataRequestMessage(): BusGetDeviceGroupDataRequestMessage {
    const msg: BusGetDeviceGroupDataRequestMessage = {
        header: { type: MessageType.busGetDeviceGroupDataRequest },
        body: {} as BusGetDeviceGroupDataRequestMessageBody,
    };
    return msg;
}