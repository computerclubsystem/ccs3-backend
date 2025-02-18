import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';

export type OperatorUpdateProfileSettingsReplyMessageBody = object;

export type OperatorUpdateProfileSettingsReplyMessage = OperatorReplyMessage<OperatorUpdateProfileSettingsReplyMessageBody>;

export function createOperatorUpdateProfileSettingsReplyMessage(): OperatorUpdateProfileSettingsReplyMessage {
    const msg: OperatorUpdateProfileSettingsReplyMessage = {
        header: { type: OperatorReplyMessageType.updateProfileSettingsReply },
        body: {},
    };
    return msg;
}