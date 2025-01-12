export class PermissionQueryHelper {
    public readonly getAllPermissionsQueryText = `
        SELECT
            id,
            name,
            description
        FROM permission
    `;
}
