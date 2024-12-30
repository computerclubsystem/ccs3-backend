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
}
