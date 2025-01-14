export const enum MessageType {
    // Devices
    deviceSetStatus = 'device-set-status',
    deviceConfiguration = 'device-configuration',

    // Internal message bus
    busDeviceGetByCertificateRequest = 'bus-device-get-by-certificate-request',
    busDeviceGetByCertificateReply = 'bus-device-get-by-certificate-reply',
    busDeviceStatuses = 'bus-device-statuses',
    busDeviceConnectionEvent = 'bus-device-connection-event',

    busDeviceUnknownDeviceConnectedRequest = 'bus-device-unknown-device-connected-request',
    busDeviceUnknownDeviceConnectedReply = 'bus-device-unknown-device-connected-reply',

    busOperatorAuthRequest = 'bus-operator-auth-request',
    busOperatorAuthReply = 'bus-operator-auth-reply',

    busOperatorConnectionEvent = 'bus-operator-connection-event',

    busOperatorGetAllDevicesRequest = 'bus-operator-get-all-devices-request',
    busOperatorGetAllDevicesReply = 'bus-operator-get-all-devices-reply',
    busOperatorGetDeviceByIdRequest = 'bus-operator-get-device-by-id-request',
    busOperatorGetDeviceByIdReply = 'bus-operator-get-device-by-id-reply',
    
    busUpdateDeviceRequest = 'bus-update-device-request',
    busUpdateDeviceReply = 'bus-update-device-reply',

    busStartDeviceRequest = 'bus-start-device-request',
    busStartDeviceReply = 'bus-start-device-reply',
    busStopDeviceRequest = 'bus-stop-device-request',
    busStopDeviceReply = 'bus-stop-device-reply',

    busGetTariffByIdRequest = 'bus-get-tariff-by-id-request',
    busGetTariffByIdReply = 'bus-get-tariff-by-id-reply',
    busGetAllTariffsRequest = 'bus-get-all-tariffs-request',
    busGetAllTariffsReply = 'bus-get-all-tariffs-reply',
    busCreateTariffRequest = 'bus-create-tariff-request',
    busCreateTariffReply = 'bus-create-tariff-reply',
    busUpdateTariffRequest = 'bus-update-tariff-request',
    busUpdateTariffReply = 'bus-update-tariff-reply',

    busGetAllRolesRequest = 'bus-get-all-roles-request',
    busGetAllRolesReply = 'bus-get-all-roles-reply',
    busGetRoleWithPermissionsRequest = 'bus-get-role-with-permissions-request',
    busGetRoleWithPermissionsReply = 'bus-get-role-with-permissions-reply',
    busCreateRoleWithPermissionsRequest = 'bus-create-role-with-permissions-request',
    busCreateRoleWithPermissionsReply = 'bus-create-role-with-permissions-reply',
    busUpdateRoleWithPermissionsRequest = 'bus-update-role-with-permissions-request',
    busUpdateRoleWithPermissionsReply = 'bus-update-role-with-permissions-reply',
    busGetAllPermissionsRequest = 'bus-get-all-permissions-request',
    busGetAllPermissionsReply = 'bus-get-all-permissions-reply',
    busGetAllUsersRequest = 'bus-get-all-users-request',
    busGetAllUsersReply = 'bus-get-all-users-reply',

    // User with roles
    busCreateUserWithRolesRequest = 'bus-create-user-with-roles-request',
    busCreateUserWithRolesReply = 'bus-create-user-with-roles-reply',
    busUpdateUserWithRolesRequest = 'bus-update-user-with-roles-request',
    busUpdateUserWithRolesReply = 'bus-update-user-with-roles-reply',
    busGetUserWithRolesRequest = 'bus-get-user-with-roles-request',
    busGetUserWithRolesReply = 'bus-get-user-with-roles-reply',
}
