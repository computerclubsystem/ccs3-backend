export enum OperatorRequestMessageType {
    authRequest = 'auth-request',
    pingRequest = 'ping-request',
    refreshTokenRequest = 'refresh-token-request',
    signOutRequest = 'sign-out-request',
    getAllDevicesRequest = 'get-all-devices-request',
    getDeviceByIdRequest = 'get-device-by-id-request',
    updateDeviceRequest = 'update-device-request',
    getAllTariffsRequest = 'get-all-tariffs-request',
    createTariffRequest = 'create-tariff-request',
    updateTariffRequest = 'update-tariff-request',
    rechargeTariffDurationRequest = 'recharge-tariff-duration-request',
    startDeviceRequest = 'start-device-request',
    stopDeviceRequest = 'stop-device-request',
    getDeviceStatusesRequest = 'get-device-statuses-request',
    getTariffByIdRequest = 'get-tariff-by-id-request',
    getAllRolesRequest = 'get-all-roles-request',
    getRoleWithPermissionsRequest = 'get-role-with-permissions-request',
    createRoleWithPermissionsRequest = 'create-role-with-permissions-request',
    getAllPermissionsRequest = 'get-all-permissions-request',
    updateRoleWithPermissionsRequest = 'update-role-with-permissions-request',
    getAllUsersRequest = 'get-all-users-request',
    getUserWithRolesRequest = 'get-user-with-roles-request',
    createUserWithRolesRequest = 'create-user-with-roles-request',
    updateUserWithRolesRequest = 'update-user-with-roles-request',
    transferDeviceRequest = 'transfer-device-request',
    createDeviceContinuationRequest = 'create-device-continuation-request',
    deleteDeviceContinuationRequest = 'delete-device-continuation-request',
    getSigndInUsersRequest = 'get-signed-in-users-request',
    forceSignOutAllUserSessionsRequest = 'force-sign-out-all-user-sessions-request',
    getCurrentShiftStatusRequest = 'get-current-shift-status-request',
    completeShiftRequest = 'complete-shift-request',
}

export enum OperatorReplyMessageType {
    authReply = 'auth-reply',
    refreshTokenReply = 'refresh-token-reply',
    signOutReply = 'sign-out-reply',
    getAllDevicesReply = 'get-all-devices-reply',
    getDeviceByIdReply = 'get-device-by-id-reply',
    updateDeviceReply = 'update-device-reply',
    getTariffByIdReply = 'get-tariff-by-id-reply',
    createTariffReply = 'create-tariff-reply',
    rechargeTariffDurationReply = 'recharge-tariff-duration-reply',
    getAllTariffsReply = 'get-all-tariffs-reply',
    startDeviceReply = 'start-device-reply',
    stopDeviceReply = 'stop-device-reply',
    getDeviceStatusesReply = 'get-device-statuses-reply',
    updateTariffReply = 'update-tariff-reply',
    getAllRolesReply = 'get-all-roles-reply',
    getRoleWithPermissionsReply = 'get-role-with-permissions-reply',
    createRoleWithPermissionsReply = 'create-role-with-permissions-reply',
    getAllPermissionsReply = 'get-all-permissions-reply',
    updateRoleWithPermissionsReply = 'update-role-with-permissions-reply',
    getAllUsersReply = 'get-all-users-reply',
    getUserWithRolesReply = 'get-user-with-roles-reply',
    createUserWithRolesReply = 'create-user-with-roles-reply',
    updateUserWithRolesReply = 'update-user-with-roles-reply',
    notAuthenticatedReply = 'not-authenticated-reply',
    notAuthorizedReply = 'not-authorized-reply',
    transferDeviceReply = 'transfer-device-reply',
    createDeviceContinuationReply = 'create-device-continuation-reply',
    deleteDeviceContinuationReply = 'delete-device-continuation-reply',
    getSigndInUsersReply = 'get-signed-in-users-reply',
    forceSignOutAllUserSessionsReply = 'force-sign-out-all-user-sessions-reply',
    getCurrentShiftStatusReply = 'get-current-shift-status-reply',
    completeShiftReply = 'complete-shift-reply',
}

export enum OperatorNotificationMessageType {
    configuration = 'configuration',
    deviceStatusesNotification = 'device-statuses-notification',
    deviceConnectivitiesNotification = 'device-connectivities-notification',
    signedOutNotification = 'signed-out-notification',
}
