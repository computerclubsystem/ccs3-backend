import { SystemSetting } from 'src/entities/system-setting.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';

export interface OperatorGetAllSystemSettingsReplyMessageBody {
    systemSettings: SystemSetting[];
}

export type OperatorGetAllSystemSettingsReplyMessage = OperatorReplyMessage<OperatorGetAllSystemSettingsReplyMessageBody>;

export function createOperatorGetAllSystemSettingsReplyMessage(): OperatorGetAllSystemSettingsReplyMessage {
    const msg: OperatorGetAllSystemSettingsReplyMessage = {
        header: { type: OperatorReplyMessageType.getAllSystemSettingsReply },
        body: {} as OperatorGetAllSystemSettingsReplyMessageBody,
    };
    return msg;
}