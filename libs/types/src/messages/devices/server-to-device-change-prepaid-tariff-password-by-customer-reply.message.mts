import { ServerToDeviceReplyMessageHeader } from './declarations/server-to-device-reply-message-header.mjs';
import { ServerToDeviceReplyMessageType } from './declarations/server-to-device-reply-message-type.mjs';
import { ServerToDeviceReplyMessage } from './declarations/server-to-device-reply-message.mjs';

export type ServerToDeviceChangePrepaidTariffPasswordPasswordByCustomerReplyMessageBody = object;

export type ServerToDeviceChangePrepaidTariffPasswordPasswordByCustomerReplyMessage = ServerToDeviceReplyMessage<ServerToDeviceChangePrepaidTariffPasswordPasswordByCustomerReplyMessageBody>;

export function createServerToDeviceChangePrepaidTariffPasswordPasswordByCustomerReplyMessage(): ServerToDeviceChangePrepaidTariffPasswordPasswordByCustomerReplyMessage {
    const msg: ServerToDeviceChangePrepaidTariffPasswordPasswordByCustomerReplyMessage = {
        header: {
            type: ServerToDeviceReplyMessageType.changePrepaidTariffPasswordByCustomer,
        } as ServerToDeviceReplyMessageHeader,
        body: {} as ServerToDeviceChangePrepaidTariffPasswordPasswordByCustomerReplyMessageBody,
    };
    return msg;
}