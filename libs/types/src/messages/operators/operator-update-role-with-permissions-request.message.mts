import { Role } from 'src/entities/role.mjs';
import { OperatorMessage } from './declarations/operator.message.mjs';

export interface OperatorUpdateRoleWithPermissionsRequestMessageBody {
    role: Role;
    rolePermissionIds: number[];
}

export interface OperatorUpdateRoleWithPermissionsRequestMessage extends OperatorMessage<OperatorUpdateRoleWithPermissionsRequestMessageBody> {
}
