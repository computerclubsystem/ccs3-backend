export const enum MessageType {
    // Device sessions
    busGetDeviceCompletedSessionsRequest = 'bus-get-device-completed-sessions-request',
    busGetDeviceCompletedSessionsReply = 'bus-get-device-completed-sessions-reply',

    // Allowed device objects
    busGetAllAllowedDeviceObjectsRequest = 'bus-get-all-allowed-device-objects-request',
    busGetAllAllowedDeviceObjectsReply = 'bus-get-all-allowed-device-objects-reply',

    // Device groups
    busUpdateDeviceGroupRequest = 'bus-update-device-group-request',
    busUpdateDeviceGroupReply = 'bus-update-device-group-reply',
    busCreateDeviceGroupRequest = 'bus-create-device-group-request',
    busCreateDeviceGroupReply = 'bus-create-device-group-reply',
    busGetAllDeviceGroupsRequest = 'bus-get-all-device-groups-request',
    busGetAllDeviceGroupsReply = 'bus-get-all-device-groups-reply',
    busGetDeviceGroupDataRequest = 'bus-get-device-group-data-request',
    busGetDeviceGroupDataReply = 'bus-get-device-group-data-reply',

    // System settings
    busUpdateSystemSettingsValuesRequest = 'bus-update-system-settings-values-request',
    busUpdateSystemSettingsValuesReply = 'bus-update-system-settings-values-reply',
    busGetAllSystemSettingsRequest = 'bus-get-all-system-settings-request',
    busGetAllSystemSettingsReply = 'bus-get-all-system-settings-reply',
    busAllSystemSettingsNotification = 'bus-all-system-settings-notification',

    busDeviceConnectivitiesNotification = 'bus-device-connectivities-notification',
    busDeviceGetByCertificateRequest = 'bus-device-get-by-certificate-request',
    busDeviceGetByCertificateReply = 'bus-device-get-by-certificate-reply',
    busDeviceStatuses = 'bus-device-statuses',
    busDeviceConnectionEvent = 'bus-device-connection-event',

    busSetDeviceStatusNoteRequest = 'bus-set-device-status-note-request',
    busSetDeviceStatusNoteReply = 'bus-set-device-status-note-reply',

    busDeviceUnknownDeviceConnectedRequest = 'bus-device-unknown-device-connected-request',
    busDeviceUnknownDeviceConnectedReply = 'bus-device-unknown-device-connected-reply',

    busCreateDeviceRequest = 'bus-create-device-request',
    busCreateDeviceReply = 'bus-create-device-reply',

    // Authentication
    busOperatorAuthRequest = 'bus-operator-auth-request',
    busOperatorAuthReply = 'bus-operator-auth-reply',
    busChangePasswordRequest = 'bus-change-password-request',
    busChangePasswordReply = 'bus-change-password-reply',

    // Profile
    busUpdateProfileSettingsRequest = 'bus-update-profile-settings-request',
    busUpdateProfileSettingsReply = 'bus-update-profile-settings-reply',
    busGetProfileSettingsRequest = 'bus-get-profile-settings-request',
    busGetProfileSettingsReply = 'bus-get-profile-settings-reply',

    // Shifts
    busGetLastCompletedShiftRequest = 'bus-get-last-completed-shift-request',
    busGetLastCompletedShiftReply = 'bus-get-last-completed-shift-reply',
    busGetCurrentShiftStatusRequest = 'bus-get-current-shift-status-request',
    busGetCurrentShiftStatusReply = 'bus-get-current-shift-status-reply',
    busCompleteShiftRequest = 'bus-complete-shift-request',
    busCompleteShiftReply = 'bus-complete-shift-reply',
    busGetShiftsRequest = 'bus-get-shifts-request',
    busGetShiftsReply = 'bus-get-shifts-reply',

    busOperatorConnectionEvent = 'bus-operator-connection-event',

    // Devices
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
    busTransferDeviceRequest = 'bus-transfer-device-request',
    busTransferDeviceReply = 'bus-transfer-device-reply',
    busCreateDeviceContinuationRequest = 'bus-create-device-continuation-request',
    busCreateDeviceContinuationReply = 'bus-create-device-continuation-reply',
    busDeleteDeviceContinuationRequest = 'bus-delete-device-continuation-request',
    busDeleteDeviceContinuationReply = 'bus-delete-device-continuation-reply',

    busStartDeviceOnPrepaidTariffByCustomerRequest = 'bus-start-device-on-prepaid-tariff-by-customer-request',
    busStartDeviceOnPrepaidTariffByCustomerReply = 'bus-start-device-on-prepaid-tariff-by-customer-reply',
    busEndDeviceSessionByCustomerRequest = 'bus-end-device-session-by-customer-request',
    busEndDeviceSessionByCustomerReply = 'bus-end-device-session-by-customer-reply',
    busChangePrepaidTariffPasswordByCustomerRequest = 'bus-change-prepaid-tariff-password-by-customer-request',
    busChangePrepaidTariffPasswordByCustomerReply = 'bus-change-prepaid-tariff-password-by-customer-reply',

    // Tariffs
    busGetTariffByIdRequest = 'bus-get-tariff-by-id-request',
    busGetTariffByIdReply = 'bus-get-tariff-by-id-reply',
    busGetAllTariffsRequest = 'bus-get-all-tariffs-request',
    busGetAllTariffsReply = 'bus-get-all-tariffs-reply',
    busCreateTariffRequest = 'bus-create-tariff-request',
    busCreateTariffReply = 'bus-create-tariff-reply',
    busCreatePrepaidTariffRequest = 'bus-create-prepaid-tariff-request',
    busCreatePrepaidTariffReply = 'bus-create-prepaid-tariff-reply',
    busUpdateTariffRequest = 'bus-update-tariff-request',
    busUpdateTariffReply = 'bus-update-tariff-reply',
    busRechargeTariffDurationRequest = 'bus-recharge-tariff-duration-request',
    busRechargeTariffDurationReply = 'bus-recharge-tariff-duration-reply',

    // Roles and permissions
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
