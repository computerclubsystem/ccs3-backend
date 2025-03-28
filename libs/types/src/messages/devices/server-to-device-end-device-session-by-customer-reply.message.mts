import { ServerToDeviceReplyMessageHeader } from './declarations/server-to-device-reply-message-header.mjs';
import { ServerToDeviceReplyMessageType } from './declarations/server-to-device-reply-message-type.mjs';
import { ServerToDeviceReplyMessage } from './declarations/server-to-device-reply-message.mjs';

export type ServerToDeviceEndDeviceSessionByCustomerReplyMessageBody = object;

export type ServerToDeviceEndDeviceSessionByCustomerReplyMessage = ServerToDeviceReplyMessage<ServerToDeviceEndDeviceSessionByCustomerReplyMessageBody>;

export function createServerToDeviceEndDeviceSessionByCustomerReplyMessage(): ServerToDeviceEndDeviceSessionByCustomerReplyMessage {
    const msg: ServerToDeviceEndDeviceSessionByCustomerReplyMessage = {
        header: { type: ServerToDeviceReplyMessageType.endDeviceSessionByCustomer } as ServerToDeviceReplyMessageHeader,
        body: {} as ServerToDeviceEndDeviceSessionByCustomerReplyMessageBody,
    };
    return msg;
}