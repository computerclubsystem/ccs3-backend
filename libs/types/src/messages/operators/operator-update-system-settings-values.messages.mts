import { SystemSettingNameWithValue } from 'src/entities/system-setting-name-with-value.mjs';
import { OperatorReplyMessageType, OperatorRequestMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorUpdateSystemSettingsValuesRequestMessageBody {
    systemSettingsNameWithValues: SystemSettingNameWithValue[];
}

export type OperatorUpdateSystemSettingsValuesRequestMessage = OperatorRequestMessage<OperatorUpdateSystemSettingsValuesRequestMessageBody>;

export function createOperatorUpdateSystemSettingsValuesRequestMessage(): OperatorUpdateSystemSettingsValuesRequestMessage {
    const msg: OperatorUpdateSystemSettingsValuesRequestMessage = {
        header: { type: OperatorRequestMessageType.updateSystemSettingsValuesRequest },
        body: {} as OperatorUpdateSystemSettingsValuesRequestMessageBody,
    };
    return msg;
};


export type OperatorUpdateSystemSettingsValuesReplyMessageBody = object;

export type OperatorUpdateSystemSettingsValuesReplyMessage = OperatorReplyMessage<OperatorUpdateSystemSettingsValuesReplyMessageBody>;

export function createOperatorUpdateSystemSettingsValuesReplyMessage(): OperatorUpdateSystemSettingsValuesReplyMessage {
    const msg: OperatorUpdateSystemSettingsValuesReplyMessage = {
        header: { type: OperatorReplyMessageType.updateSystemSettingsValuesReply },
        body: {},
    };
    return msg;
};