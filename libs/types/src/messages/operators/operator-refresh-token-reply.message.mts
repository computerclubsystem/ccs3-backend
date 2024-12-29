import { OperatorMessageType } from './declarations/operator-message-type.mjs';
import { OperatorMessage } from './declarations/operator.message.mjs';

export interface OperatorRefreshTokenReplyMessageBody {
    success: boolean;
    permissions?: string[];
    token?: string;
    tokenExpiresAt?: number;
}

export interface OperatorRefreshTokenReplyMessage extends OperatorMessage<OperatorRefreshTokenReplyMessageBody> {
}

export function createOperatorRefreshTokenReplyMessage(): OperatorRefreshTokenReplyMessage {
    const msg: OperatorRefreshTokenReplyMessage = {
        header: { type: OperatorMessageType.refreshTokenReply },
        body: {} as OperatorRefreshTokenReplyMessageBody,
    };
    return msg;
};
