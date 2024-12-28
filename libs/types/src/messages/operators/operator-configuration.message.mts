import { OperatorMessageType } from './declarations/operator-message-type.mjs';
import { OperatorMessage } from './declarations/operator.message.mjs';

export interface OperatorConfigurationMessageBody {
    pingInterval: number;
}

export interface OperatorConfigurationMessage extends OperatorMessage<OperatorConfigurationMessageBody> {
}

export function createOperatorConfigurationMessage(): OperatorConfigurationMessage {
    const msg: OperatorConfigurationMessage = {
        header: { type: OperatorMessageType.configuration },
        body: {} as OperatorConfigurationMessageBody,
    };
    return msg;
};
