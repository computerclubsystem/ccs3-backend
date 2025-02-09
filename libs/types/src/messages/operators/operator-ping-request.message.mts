import { OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorPingRequestMessageBody {
}

export interface OperatorPingRequestMessage extends OperatorRequestMessage<OperatorPingRequestMessageBody> {
}
