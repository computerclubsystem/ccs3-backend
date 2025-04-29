import { DeviceToServerRequestMessage } from './declarations/device-to-server-request-message.mjs';

export type DeviceToServerCreateSignInCodeRequestMessageBody = object;

export type DeviceToServerCreateSignInCodeRequestMessage = DeviceToServerRequestMessage<DeviceToServerCreateSignInCodeRequestMessageBody>;
