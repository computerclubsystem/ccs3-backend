export enum OperatorMessageType {
    authRequest = 'auth-request',
    authReply = 'auth-reply',
    configuration = 'configuration',
    pingRequest = 'ping-request',
    refreshTokenRequest = 'refresh-token-request',
    refreshTokenReply = 'refresh-token-reply',
    notAuthenticated = 'not-authenticated',
    signOutRequest = 'sign-out-request',
    signOutReply = 'sign-out-reply',
    getAllDevicesRequest = 'get-all-devices-request',
    getAllDevicesReply = 'get-all-devices-reply',
    getDeviceByIdRequest = 'get-device-by-id-request',
    getDeviceByIdReply = 'get-device-by-id-reply',
    updateDeviceRequest = 'update-device-request',
    updateDeviceReply = 'update-device-reply',
    getAllTariffsRequest = 'get-all-tariffs-request',
    getAllTariffsReply = 'get-all-tariffs-reply',
    createTariffRequest = 'create-tariff-request',
    // createTariffReply = 'create-tariff-reply',
    updateTariffRequest = 'update-tariff-request',
    startDeviceRequest = 'start-device-request',
    getDeviceStatusesRequest = 'get-device-statuses-request',
    getTariffByIdRequest = 'get-tariff-by-id-request',
    getAllRolesRequest = 'get-all-roles-request',
    getRoleWithPermissionsRequest = 'get-role-with-permissions-request',
    createRoleWithPermissionsRequest = 'create-role-with-permissions-request',
    getAllPermissionsRequest = 'get-all-permissions-request',
    updateRoleWithPermissionsRequest = 'update-role-with-permissions-request',
}

export const enum OperatorReplyMessageType {
    getTariffByIdReply = 'get-tariff-by-id-reply',
    createTariffReply = 'create-tariff-reply',
    startDeviceReply = 'start-device-reply',
    getDeviceStatusesReply = 'get-device-statuses-reply',
    updateTariffReply = 'update-tariff-reply',
    getAllRolesReply = 'get-all-roles-reply',
    getRoleWithPermissionsReply = 'get-role-with-permissions-reply',
    createRoleWithPermissionsReply = 'create-role-with-permissions-reply',
    getAllPermissionsReply = 'get-all-permissions-reply',
    updateRoleWithPermissionsReply = 'update-role-with-permissions-reply',
}

export const enum OperatorNotificationMessageType {
    deviceStatusesNotification = 'device-statuses-notification',
}
