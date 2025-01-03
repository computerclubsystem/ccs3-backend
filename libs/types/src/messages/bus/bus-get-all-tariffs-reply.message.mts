import { Message } from '../declarations/message.mjs';
import { transferSharedMessageData } from '../utils.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Tariff } from 'src/entities/tariff.mjs';

export interface BusGetAllTariffsReplyMessageBody {
    tariffs: Tariff[];
}

export interface BusGetAllTariffsReplyMessage extends Message<BusGetAllTariffsReplyMessageBody> {
}

export function createBusGetAllTariffsReplyMessage<TBody>(sourceMessage?: Message<TBody> | null): BusGetAllTariffsReplyMessage {
    const msg: BusGetAllTariffsReplyMessage = {
        header: { type: MessageType.busGetAllTariffsReply },
        body: {} as BusGetAllTariffsReplyMessageBody,
    };
    transferSharedMessageData(msg, sourceMessage);
    return msg;
};
