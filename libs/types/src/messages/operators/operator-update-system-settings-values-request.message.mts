import { SystemSettingNameWithValue } from 'src/entities/system-setting-name-with-value.mjs';
import { OperatorRequestMessageType } from './declarations/operator-message-type.mjs';
import { OperatorRequestMessage } from './declarations/operator.message.mjs';

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
}
