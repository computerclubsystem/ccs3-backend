import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';

export type OperatorUpdateSystemSettingsValuesReplyMessageBody = object;

export type OperatorUpdateSystemSettingsValuesReplyMessage = OperatorReplyMessage<OperatorUpdateSystemSettingsValuesReplyMessageBody>;

export function createOperatorUpdateSystemSettingsValuesReplyMessage(): OperatorUpdateSystemSettingsValuesReplyMessage {
    const msg: OperatorUpdateSystemSettingsValuesReplyMessage = {
        header: { type: OperatorReplyMessageType.updateSystemSettingsValuesReply },
        body: {},
    };
    return msg;
}