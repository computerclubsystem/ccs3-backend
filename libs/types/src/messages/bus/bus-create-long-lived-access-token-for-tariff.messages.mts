import { LongLivedAccessToken } from 'src/entities/long-lived-access-token.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusCreateLongLivedAccessTokenForTariffRequestMessageBody {
    tariffId: number;
    passwordHash: string;
}

export type BusCreateLongLivedAccessTokenForTariffRequestMessage = Message<BusCreateLongLivedAccessTokenForTariffRequestMessageBody>;

export function createBusCreateLongLivedAccessTokenForTariffRequestMessage(): BusCreateLongLivedAccessTokenForTariffRequestMessage {
    const msg: BusCreateLongLivedAccessTokenForTariffRequestMessage = {
        header: { type: MessageType.busCreateLongLivedAccessTokenForTariffRequest },
        body: {} as BusCreateLongLivedAccessTokenForTariffRequestMessageBody,
    };
    return msg;
}


export interface BusCreateLongLivedAccessTokenForTariffReplyMessageBody {
    longLivedToken: LongLivedAccessToken;
}

export type BusCreateLongLivedAccessTokenForTariffReplyMessage = Message<BusCreateLongLivedAccessTokenForTariffReplyMessageBody>;

export function createBusCreateLongLivedAccessTokenForTariffReplyMessage(): BusCreateLongLivedAccessTokenForTariffReplyMessage {
    const msg: BusCreateLongLivedAccessTokenForTariffReplyMessage = {
        header: { type: MessageType.busCreateLongLivedAccessTokenForTariffReply },
        body: {} as BusCreateLongLivedAccessTokenForTariffReplyMessageBody,
    };
    return msg;
}