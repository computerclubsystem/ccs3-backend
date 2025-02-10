import { SystemSettingNameWithValue } from 'src/entities/system-setting-name-with-value.mjs';
import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';

export interface BusUpdateSystemSettingsValuesRequestMessageBody {
    systemSettingsNameWithValues: SystemSettingNameWithValue[];
}

export type BusUpdateSystemSettingsValuesRequestMessage = Message<BusUpdateSystemSettingsValuesRequestMessageBody>;

export function createBusUpdateSystemSettingsValuesRequestMessage(): BusUpdateSystemSettingsValuesRequestMessage {
    const msg: BusUpdateSystemSettingsValuesRequestMessage = {
        header: { type: MessageType.busUpdateSystemSettingsValuesRequest },
        body: {} as BusUpdateSystemSettingsValuesRequestMessageBody,
    };
    return msg;
}