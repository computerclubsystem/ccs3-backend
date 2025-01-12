import { OperatorMessage } from './declarations/operator.message.mjs';

export interface OperatorGetRoleWithPermissionsRequestMessageBody {
    roleId: number;
}

export interface OperatorGetRoleWithPermissionsRequestMessage extends OperatorMessage<OperatorGetRoleWithPermissionsRequestMessageBody> {
}
