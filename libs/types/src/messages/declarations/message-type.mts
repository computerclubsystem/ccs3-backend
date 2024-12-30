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

    // // Operators
    // operatorAuthRequest = 'auth-request',
    // operatorAuthReply = 'auth-reply',
    // operatorConfiguration = 'configuration'
}
