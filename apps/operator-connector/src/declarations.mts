import { DetailedPeerCertificate } from 'node:tls';
import { IncomingHttpHeaders } from 'node:http2';
import { UserAuthDataCacheValue } from './cache-helper.mjs';
import { Permission } from '@computerclubsystem/types/entities/permission.mjs';
import { TariffValidator } from './tariff-validator.mjs';
import { BusDeviceStatusesNotificationMessage } from '@computerclubsystem/types/messages/bus/bus-device-statuses-notification.message.mjs';
import { ChannelName } from '@computerclubsystem/types/channels/channel-name.mjs';
import { SystemSetting } from '@computerclubsystem/types/entities/system-setting.mjs';
import { FilterServerLogsItem } from '@computerclubsystem/types/messages/shared-declarations/filter-server-logs-item.mjs';
import { PermissionName } from '@computerclubsystem/types/entities/declarations/permission-name.mjs';

export interface ConnectedClientData {
    connectionId: number;
    connectedAt: number;
    /**
     * Operator ID in the system
     */
    userId?: number | null;
    /**
     * The client certificate - most likely will be empty since operators usually do not provide certificates
     * but authenticate with user/password
     */
    certificate?: DetailedPeerCertificate | null;
    /**
     * certificate.fingeprint without the colon separator and lowercased
     */
    certificateThumbprint?: string;
    ipAddress: string | null;
    lastMessageReceivedAt: number | null;
    receivedMessagesCount: number;
    receivedPingMessagesCount: number;
    sentMessagesCount: number;
    /**
     * Whether the client is authenticated to use the system
     * While the system checks the client, it will not send messages to the client or process messages from it
     */
    isAuthenticated: boolean;
    headers: IncomingHttpHeaders;
    /**
     * Since the connectionId is monotonically increasing number starting from 1
     * we need another random ID to distinguish connections between service instances that own the connection
     * This will be used to match the ConnectedClientData along with connectionId
     */
    connectionInstanceId: string;
    /**
     * Permissions of the operator
     */
    permissions: Set<PermissionName>;
    /**
     * The count of unauthorized messages received by the client. Can be used to close the connection if specific limit is reached
     */
    unauthorizedMessageRequestsCount: number;
}

// interface ConnectionRoundTripData extends RoundTripData {
//     connectionId: number;
// }

export const enum ConnectionCleanUpReason {
    authenticationTimeout = 'authentication-timeout',
    noMessagesReceived = 'no-messages-received',
    idleTimeout = 'idle-timeout',
}

export interface OperatorConnectorState {
    idleTimeout: number;
    authenticationTimeout: number;
    pingInterval: number;
    cleanUpClientConnectionsInterval: number;
    messageBusReplyTimeout: number;
    operatorChannelMessageStatItems: MessageStatItem[];
    clientConnectionsMonitorTimerHandle?: NodeJS.Timeout;
    mainTimerHandle?: NodeJS.Timeout;
    lastBusDeviceStatusesNotificationMessage?: BusDeviceStatusesNotificationMessage;
    systemSettings: SystemSetting[];
    filterLogsItem?: FilterServerLogsItem | null;
    filterLogsRequestedAt?: number | null;
    anonymousMessageTypesSet: Set<string>;
    codeSignInDurationSeconds: number;
    isQrCodeSignInFeatureEnabled: boolean;
    cleanUpCodeSignInInterval: number;
    lastCodeSignInCleanUpAt?: number | null;
    tokenExpirationMilliseconds: number;
}

export interface OperatorConnectorValidators {
    tariff: TariffValidator;
}

export interface IsTokenActiveResult {
    isActive: boolean;
    authTokenCacheValue?: UserAuthDataCacheValue;
}

export enum CanProcessOperatorMessageResultErrorReason {
    tokenExpired = 'token-expired',
    messageTypeIsMissing = 'message-type-is-missing',
    messageRequiresAuthentication = 'message-requires-authentication',
    tokenNotProvided = 'token-not-provided',
    tokenNotFound = 'token-not-found',
    notAuthorized = 'not-authorized',
}

export interface CanProcessOperatorMessageResult {
    canProcess: boolean;
    errorReason?: CanProcessOperatorMessageResultErrorReason;
}

export enum IsAuthorizedResultReason {
    /**
     * When the permissions include "all"
     */
    hasAllPermissions = 'has-all-permissions',
    /**
     * When required permission is found
     */
    hasRequiredPermissions = 'has-required-permissions',
    /**
     * When permissions does not include one or more required permissions
     */
    missingPermission = 'missing-permission',
    /**
     * It is unknown what permissions are needed to check. Will happen only if the message type is unknown for the permission check logic
     */
    unknownPermissionsRequired = 'unknown-permissions-required',
    /**
     * When the message does not need permissions (like the message for authenticating, refreshing the token, pinging etc. (the last 2 are authorized by the presence of valid token only, permission is not needed))
     */
    permissionIsNotRequired = 'permission-is-not-required',
    /**
     * Some messages does not need permissions but need the user to be authenticated
     */
    notAuthenticated = 'not-authenticated',
}

export interface IsAuthorizedResult {
    authorized: boolean;
    reason: IsAuthorizedResultReason;
    missingPermissions?: Permission[];
}

export interface MessageStatItem {
    type: string;
    channel: ChannelName;
    correlationId?: string;
    sentAt: number;
    completedAt: number;
    error?: Error;
    operatorId?: number | null;
}

export interface CodeSignIn {
    connectionInstanceId: string;
    code: string;
    createdAt: number;
}
