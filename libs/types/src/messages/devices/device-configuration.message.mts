import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface DeviceConfigurationMessageBody {
    pingInterval: number;
}

// TODO: Messages from and to devices must have different shape - the header does not need "source", "target" etc.
export interface DeviceConfigurationMessage extends Message<DeviceConfigurationMessageBody> {
}

export function createDeviceConfigurationMessage(): DeviceConfigurationMessage {
    const msg: DeviceConfigurationMessage = {
        header: { type: MessageType.deviceConfiguration },
        body: {} as DeviceConfigurationMessageBody,
    };
    return msg;
};