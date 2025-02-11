import { SystemSetting } from 'src/entities/system-setting.mjs';
import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';

export interface BusAllSystemSettingsNotificationMessageBody {
    systemSettings: SystemSetting[];
}

export type BusAllSystemSettingsNotificationMessage = Message<BusAllSystemSettingsNotificationMessageBody>;

export function createBusAllSystemSettingsNotificationMessage(): BusAllSystemSettingsNotificationMessage {
    const msg: BusAllSystemSettingsNotificationMessage = {
        header: { type: MessageType.busAllSystemSettingsNotification },
        body: {} as BusAllSystemSettingsNotificationMessageBody,
    };
    return msg;
}