import { IUser } from 'src/storage/entities/user.mjs';
import { IQueryTextWithParamsResult } from './query-with-params.mjs';

export class UserQueryHelper {
    updateUserPasswordHash(userId: number, passwordHash: string): IQueryTextWithParamsResult {
        const params = [
            userId,
            passwordHash,
        ];
        return {
            text: this.updateUserPasswordHashQueryText,
            params: params,
        };
    }

    private readonly updateUserPasswordHashQueryText = `
        UPDATE "user"
        SET password_hash = $2
        WHERE id = $1
    `;

    changePasswordQueryData(userId: number, currentPasswordHash: string, newPasswordHash: string): IQueryTextWithParamsResult {
        const params = [
            userId,
            currentPasswordHash,
            newPasswordHash,
        ];
        return {
            text: this.changePasswordQueryText,
            params: params,
        };
    }

    private readonly changePasswordQueryText = `
        UPDATE "user"
        SET password_hash = $3
        WHERE id = $1 and password_hash = $2
    `;

    updateUserQueryData(user: IUser, passwordHash?: string): IQueryTextWithParamsResult {
        const params: unknown[] = [
            user.enabled,
            user.updated_at,
        ];
        if (passwordHash) {
            params.push(passwordHash);
            params.push(user.id);
            return {
                text: this.updateUserQueryText,
                params: params,
            };
        } else {
            params.push(user.id);
            return {
                text: this.updateUserWithoutPasswordHashQueryText,
                params: params,
            };
        }
    }

    private readonly updateUserQueryText = `
        UPDATE "user"
        SET enabled = $1,
            updated_at = $2,
            password_hash = $3
        WHERE id = $4
        RETURNING
            id,
            username,
            enabled,
            created_at,
            updated_at
    `;

    private readonly updateUserWithoutPasswordHashQueryText = `
        UPDATE "user"
        SET enabled = $1,
            updated_at = $2
        WHERE id = $3
        RETURNING
            id,
            username,
            enabled,
            created_at,
            updated_at
    `;

    replaceUserRolesQueryData(userId: number, roleIds: number[]): IQueryTextWithParamsResult {
        // TODO: Find better way like returning multiple lines with their parameters so the caller can execute them one by one
        userId = +userId;
        const parts: string[] = [this.deleteUserRolesQueryText.replace('$1', `${userId}`)];
        for (const roleId of roleIds) {
            const addRoleText = this.addRoleToUserQueryText.replace('$1', `${userId}`).replace('$2', `${+roleId}`);
            parts.push(addRoleText);
        }
        const fullQueryText = parts.join('\r\n');
        return {
            text: fullQueryText,
            // TODO: Params are not needed because we replaced $1, $2 parameters with their values - instead return multiple lines with their parameters
            params: undefined,
        };
    }

    private readonly addRoleToUserQueryText = `
        INSERT INTO user_in_role
        (
            user_id,
            role_id
        )
        VALUES
        (
            $1,
            $2
        );
    `;

    private readonly deleteUserRolesQueryText = `
        DELETE FROM user_in_role
        WHERE user_id = $1;
    `;

    createUserQueryData(user: IUser, passwordHash: string): IQueryTextWithParamsResult {
        const params = [
            user.username,
            user.enabled,
            user.created_at,
            passwordHash,
        ];
        return {
            text: this.createUserQueryText,
            params: params,
        };
    }

    private readonly createUserQueryText = `
        INSERT INTO "user"
        (
            username,
            enabled,
            created_at,
            password_hash
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4
        )
        RETURNING
            id,
            username,
            enabled,
            created_at
    `;

    getUserRoleIdsQueryData(userId: number): IQueryTextWithParamsResult {
        const params = [
            userId,
        ];
        return {
            text: this.getUserRoleIdsQueryText,
            params: params,
        };
    }

    getUserByIdQueryData(userId: number): IQueryTextWithParamsResult {
        const params: [number] = [
            userId,
        ];
        return {
            text: this.getUserByIdQueryText,
            params,
        };
    }

    getUserByUsernameAndPasswordHashQueryData(username: string, passwordHash: string): IQueryTextWithParamsResult {
        const params: unknown[] = [
            username,
            passwordHash,
        ];
        return {
            text: this.getUserByUsernameAndPasswordHashQueryText,
            params,
        };
    }

    getUserPermissionsQueryData(userId: number): IQueryTextWithParamsResult {
        const params: [number] = [
            userId,
        ];
        return {
            text: this.getUserPermissionsQueryText,
            params,
        };
    }

    private readonly getUserRoleIdsQueryText = `
        SELECT role_id
        FROM user_in_role
        WHERE user_id = $1
    `;

    public readonly getAllUsersQueryText = `
        SELECT
            id,
            username,
            enabled,
            created_at,
            updated_at
        FROM "user"
    `;

    private readonly getUserPermissionsQueryText = `
        SELECT p.name 
        FROM permission_in_role AS pir
        INNER JOIN role AS r ON r.id = pir.role_id
        INNER JOIN permission AS p ON p.id = pir.permission_id
        INNER JOIN user_in_role AS uir ON uir.role_id = r.id
        INNER JOIN "user" AS u ON u.id = uir.user_id
        WHERE u.id = $1
          AND r.enabled = true
    `;

    private readonly getUserByUsernameAndPasswordHashQueryText = `
        SELECT 
            id,
            username,
            enabled,
            created_at,
            updated_at
        FROM "user"
        WHERE username = $1 AND password_hash = $2
    `;

    private readonly getUserByIdQueryText = `
        SELECT 
            id,
            username,
            enabled
        FROM "user"
        WHERE id = $1
    `;
}
