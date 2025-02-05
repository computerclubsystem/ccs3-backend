import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';

export interface OperatorRefreshTokenReplyMessageBody {
    success: boolean;
    permissions?: string[];
    token?: string;
    tokenExpiresAt?: number;
}

export interface OperatorRefreshTokenReplyMessage extends OperatorReplyMessage<OperatorRefreshTokenReplyMessageBody> {
}

export function createOperatorRefreshTokenReplyMessage(): OperatorRefreshTokenReplyMessage {
    const msg: OperatorRefreshTokenReplyMessage = {
        header: { type: OperatorReplyMessageType.refreshTokenReply },
        body: {} as OperatorRefreshTokenReplyMessageBody,
    };
    return msg;
};
