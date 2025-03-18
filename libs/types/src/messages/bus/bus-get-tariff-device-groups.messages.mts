import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusGetTariffDeviceGroupsRequestMessageBody {
    tariffId: number;
}

export type BusGetTariffDeviceGroupsRequestMessage = Message<BusGetTariffDeviceGroupsRequestMessageBody>;

export function createBusGetTariffDeviceGroupsRequestMessage(): BusGetTariffDeviceGroupsRequestMessage {
    const msg: BusGetTariffDeviceGroupsRequestMessage = {
        header: { type: MessageType.busGetTariffDeviceGroupsRequest },
        body: {} as BusGetTariffDeviceGroupsRequestMessageBody,
    };
    return msg;
};


export interface BusGetTariffDeviceGroupsReplyMessageBody {
    deviceGroupIds: number[];
}

export type BusGetTariffDeviceGroupsReplyMessage = Message<BusGetTariffDeviceGroupsReplyMessageBody>;

export function createBusGetTariffDeviceGroupsReplyMessage(): BusGetTariffDeviceGroupsReplyMessage {
    const msg: BusGetTariffDeviceGroupsReplyMessage = {
        header: { type: MessageType.busGetTariffDeviceGroupsReply },
        body: {} as BusGetTariffDeviceGroupsReplyMessageBody,
    };
    return msg;
};