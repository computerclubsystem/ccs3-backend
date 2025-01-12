import { IRole } from 'src/storage/entities/role.mjs';
import { IQueryTextWithParamsResult } from './query-with-params.mjs';

export class RoleQueryHelper {
    updateRoleQueryData(role: IRole): IQueryTextWithParamsResult {
        const params = [
            role.name,
            role.description,
            role.enabled,
            role.id,
        ];
        return {
            text: this.updateRoleQueryText,
            params: params,
        };
    }

    createRoleQueryData(role: IRole): IQueryTextWithParamsResult {
        const params = [
            role.name,
            role.description,
            role.enabled,
        ];
        return {
            text: this.createRoleQueryText,
            params: params,
        };
    }

    getRoleByIdQueryData(roleId: number): IQueryTextWithParamsResult {
        const params = [
            roleId,
        ];
        return {
            text: this.getRoleByIdQueryText,
            params: params,
        };
    }

    private readonly updateRoleQueryText = `
        UPDATE role
        SET name = $1,
            description = $2,
            enabled = $3
        WHERE id = $4
        RETURNING
            id,
            name,
            description,
            enabled
    `;

    private readonly createRoleQueryText = `
        INSERT INTO role
        (
            name,
            description,
            enabled
        )
        VALUES
        (
            $1,
            $2,
            $3
        )
        RETURNING
            id,
            name,
            description,
            enabled
    `;

    private readonly getRoleByIdQueryText = `
        SELECT
            id,
            name,
            description,
            enabled
        FROM role
        WHERE id = $1
    `;

    public readonly getAllRolesQueryText = `
        SELECT
            id,
            name,
            description,
            enabled
        FROM role
    `;
}
