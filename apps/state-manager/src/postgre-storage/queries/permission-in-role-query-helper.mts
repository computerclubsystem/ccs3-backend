import { IQueryTextWithParamsResult } from './query-with-params.mjs';

export class PermissionInRoleQueryHelper {
    replaceRolePermissionsQueryData(roleId: number, permissionIds: number[]): IQueryTextWithParamsResult {
        // TODO: Find better way like returning multiple lines with their parameters so the caller can execute them one by one
        roleId = +roleId;
        const parts: string[] = [this.deleteRolePermissionsQueryText.replace('$1', `${roleId}`)];
        for (const permissionId of permissionIds) {
            const addPermissionText = this.addPermissionToRoleQueryText.replace('$1', `${roleId}`).replace('$2', `${+permissionId}`);
            parts.push(addPermissionText);
        }
        const fullQueryText = parts.join('\r\n');
        return {
            text: fullQueryText,
            // TODO: Params are not needed because we replaced $1, $2 parameters with their values - instead return multiple lines with their parameters
            params: undefined,
        }
    }

    getRolePermissionIdsQueryData(roleId: number): IQueryTextWithParamsResult {
        const params = [
            roleId,
        ];
        return {
            text: this.getRolePermissionIdsQueryText,
            params: params,
        };
    }

    private readonly addPermissionToRoleQueryText = `
        INSERT INTO permission_in_role
        (
            role_id,
            permission_id
        )
        VALUES
        (
            $1,
            $2
        );
    `;

    private readonly deleteRolePermissionsQueryText = `
        DELETE FROM permission_in_role
        WHERE role_id = $1;
    `;

    private readonly getRolePermissionIdsQueryText = `
        SELECT permission_id
        FROM permission_in_role
        WHERE role_id = $1
    `;
}
