export const enum MessageType {
    // Devices
    deviceSetStatus = 'device-set-status',
    deviceConfiguration = 'device-configuration',
    
    // Message bus
    busDeviceGetByCertificateRequest = 'bus-device-get-by-certificate-request',
    busDeviceGetByCertificateReply = 'bus-device-get-by-certificate-reply',
    busDeviceStatuses = 'bus-device-statuses',
    busDeviceConnectionEvent = 'bus-device-connection-event',
    busOperatorAuthRequest = 'bus-operator-auth-request',
    busOperatorAuthReply = 'bus-operator-auth-reply',
    busOperatorConnectionEvent = 'bus-operator-connection-event',

    busDeviceUnknownDeviceConnectedRequest = 'bus-device-unknown-device-connected-request',
    busDeviceUnknownDeviceConnectedReply = 'bus-device-unknown-device-connected-reply',
    

    // // Operators
    // operatorAuthRequest = 'auth-request',
    // operatorAuthReply = 'auth-reply',
    // operatorConfiguration = 'configuration'
}
