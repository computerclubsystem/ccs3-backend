import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusSetTariffDeviceGroupsRequestMessageBody {
    tariffId: number;
    tariffDeviceGroupIds: number;
}

export type BusSetTariffDeviceGroupsRequestMessage = Message<BusSetTariffDeviceGroupsRequestMessageBody>;

export function createBusSetTariffDeviceGroupsRequestMessage(): BusSetTariffDeviceGroupsRequestMessage {
    const msg: BusSetTariffDeviceGroupsRequestMessage = {
        header: { type: MessageType.busSetTariffDeviceGroupsRequest },
        body: {} as BusSetTariffDeviceGroupsRequestMessageBody,
    };
    return msg;
}


export type BusSetTariffDeviceGroupsReplyMessageBody = object;

export type BusSetTariffDeviceGroupsReplyMessage = Message<BusSetTariffDeviceGroupsReplyMessageBody>;

export function createBusSetTariffDeviceGroupsReplyMessage(): BusSetTariffDeviceGroupsReplyMessage {
    const msg: BusSetTariffDeviceGroupsReplyMessage = {
        header: { type: MessageType.busSetTariffDeviceGroupsReply },
        body: {},
    };
    return msg;
};