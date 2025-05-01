import { MessageType } from "../declarations/message-type.mjs";
import { Message } from "../declarations/message.mjs";
import { BusChangePasswordWithLongLivedAccessTokenErrorCode } from "./declarations/bus-change-password-with-long-lived-access-token-error-code.mjs";

export interface BusChangePasswordWithLongLivedAccessTokenRequestMessageBody {
    token: string;
    passwordHash: string;
    ipAddress?: string | null;
}

export type BusChangePasswordWithLongLivedAccessTokenRequestMessage = Message<BusChangePasswordWithLongLivedAccessTokenRequestMessageBody>;

export function createBusChangePasswordWithLongLivedAccessTokenRequestMessage(): BusChangePasswordWithLongLivedAccessTokenRequestMessage {
    const msg: BusChangePasswordWithLongLivedAccessTokenRequestMessage = {
        header: { type: MessageType.busChangePasswordWithLongLivedAccessTokenRequest },
        body: {} as BusChangePasswordWithLongLivedAccessTokenRequestMessageBody,
    };
    return msg;
}


export interface BusChangePasswordWithLongLivedAccessTokenReplyMessageBody {
    success: boolean;
    errorCode?: BusChangePasswordWithLongLivedAccessTokenErrorCode | null;
    errorMessage?: string | null;
}

export type BusChangePasswordWithLongLivedAccessTokenReplyMessage = Message<BusChangePasswordWithLongLivedAccessTokenReplyMessageBody>;

export function createBusChangePasswordWithLongLivedAccessTokenReplyMessage(): BusChangePasswordWithLongLivedAccessTokenReplyMessage {
    const msg: BusChangePasswordWithLongLivedAccessTokenReplyMessage = {
        header: { type: MessageType.busChangePasswordWithLongLivedAccessTokenReply },
        body: {} as BusChangePasswordWithLongLivedAccessTokenReplyMessageBody,
    };
    return msg;
}