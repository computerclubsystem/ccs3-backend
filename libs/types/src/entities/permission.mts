export enum Permission {
    all = 'all',
    devicesStart = 'devices:start',
    devicesStop = 'devices:stop',
    devicesReadStatus = 'devices:read-status',
    // devicesUpdateStatus = 'devices:update-status',
    devicesReadEntities = 'devices:read-entity',
    devicesUpdateEntity = 'devices:update-entity',
    systemSettingsRead = 'system-settings:read',
    systemSettingsUpdate = 'system-settings:update',
    rolesRead = 'roles:read',
    rolesUpdate = 'roles:update',
    tariffsRead = 'tariffs:read',
    tariffsCreate = 'tariffs:create',
    tariffsUpdate = 'tariffs:update',
}
