import { OperatorReplyMessageType, OperatorRequestMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorGetTariffDeviceGroupsRequestMessageBody {
    tariffId: number;
}

export type OperatorGetTariffDeviceGroupsRequestMessage = OperatorRequestMessage<OperatorGetTariffDeviceGroupsRequestMessageBody>;


export interface OperatorGetTariffDeviceGroupsReplyMessageBody {
    deviceGroupIds: number[];
}

export type OperatorGetTariffDeviceGroupsReplyMessage = OperatorReplyMessage<OperatorGetTariffDeviceGroupsReplyMessageBody>;

export function createOperatorGetTariffDeviceGroupsReplyMessage(): OperatorGetTariffDeviceGroupsReplyMessage {
    const msg: OperatorGetTariffDeviceGroupsReplyMessage = {
        header: { type: OperatorReplyMessageType.getTariffDeviceGroupsReply },
        body: {} as OperatorGetTariffDeviceGroupsReplyMessageBody,
    };
    return msg;
};