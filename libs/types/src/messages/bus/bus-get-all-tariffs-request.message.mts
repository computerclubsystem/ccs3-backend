import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';
import { transferSharedMessageData } from '../utils.mjs';

export interface BusGetAllTariffsRequestMessageBody {
}

export interface BusGetAllTariffsRequestMessage extends Message<BusGetAllTariffsRequestMessageBody> {
}

export function createBusGetAllTariffsRequestMessage<TBody>(sourceMessage?: Message<TBody> | null): BusGetAllTariffsRequestMessage {
    const msg: BusGetAllTariffsRequestMessage = {
        header: { type: MessageType.busGetAllTariffsRequest },
        body: {} as BusGetAllTariffsRequestMessageBody,
    };
    transferSharedMessageData(msg, sourceMessage);
    return msg;
};