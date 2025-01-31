import { DeviceMessageError } from './device-message-error.mjs';
import { ServerToDeviceReplyMessageType } from './server-to-device-reply-message-type.mjs';

export interface ServerToDeviceReplyMessageHeader {
    type: ServerToDeviceReplyMessageType;
    correlationId: string;
    failure?: boolean;
    errors?: DeviceMessageError[];
}
