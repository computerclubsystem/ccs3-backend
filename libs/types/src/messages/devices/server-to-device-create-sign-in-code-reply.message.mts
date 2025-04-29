import { BusCodeSignInIdentifierType } from '../bus/declarations/bus-code-sign-in-identifier-type.mjs';
import { ServerToDeviceReplyMessageHeader } from './declarations/server-to-device-reply-message-header.mjs';
import { ServerToDeviceReplyMessageType } from './declarations/server-to-device-reply-message-type.mjs';
import { ServerToDeviceReplyMessage } from './declarations/server-to-device-reply-message.mjs';

export interface ServerToDeviceCreateSignInCodeReplyMessageBody {
    code: string;
    url: string;
    identifierType: BusCodeSignInIdentifierType;
    remainingSeconds: number;
}

export type ServerToDeviceCreateSignInCodeReplyMessage = ServerToDeviceReplyMessage<ServerToDeviceCreateSignInCodeReplyMessageBody>;

export function createServerToDeviceCreateSignInCodeReplyMessage(): ServerToDeviceCreateSignInCodeReplyMessage {
    const msg: ServerToDeviceCreateSignInCodeReplyMessage = {
        header: { type: ServerToDeviceReplyMessageType.createSignInCode } as ServerToDeviceReplyMessageHeader,
        body: {} as ServerToDeviceCreateSignInCodeReplyMessageBody,
    };
    return msg;
}