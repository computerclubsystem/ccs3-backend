import { Role } from 'src/entities/role.mjs';
import { OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorCreateRoleWithPermissionsRequestMessageBody {
    role: Role;
    rolePermissionIds: number[];
}

export interface OperatorCreateRoleWithPermissionsRequestMessage extends OperatorRequestMessage<OperatorCreateRoleWithPermissionsRequestMessageBody> {
}
