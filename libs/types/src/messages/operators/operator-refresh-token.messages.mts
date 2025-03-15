import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorRefreshTokenRequestMessageBody {
    currentToken: string;
}

export type OperatorRefreshTokenRequestMessage = OperatorRequestMessage<OperatorRefreshTokenRequestMessageBody>;


export interface OperatorRefreshTokenReplyMessageBody {
    success: boolean;
    permissions?: string[];
    token?: string;
    tokenExpiresAt?: number;
}

export type OperatorRefreshTokenReplyMessage = OperatorReplyMessage<OperatorRefreshTokenReplyMessageBody>;

export function createOperatorRefreshTokenReplyMessage(): OperatorRefreshTokenReplyMessage {
    const msg: OperatorRefreshTokenReplyMessage = {
        header: { type: OperatorReplyMessageType.refreshTokenReply },
        body: {} as OperatorRefreshTokenReplyMessageBody,
    };
    return msg;
};

