import { ServerToDeviceReplyMessageHeader } from './server-to-device-reply-message-header.mjs';

export interface ServerToDeviceReplyMessage<TBody> {
    header: ServerToDeviceReplyMessageHeader;
    body: TBody;
}
