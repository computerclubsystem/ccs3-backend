import { OperatorMessageHeader } from './operator-message-header.mjs';

export interface OperatorMessage<TBody> {
    header: OperatorMessageHeader;
    body: TBody;
}
