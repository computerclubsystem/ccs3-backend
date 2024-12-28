import { DetailedPeerCertificate } from 'node:tls';
import { IncomingHttpHeaders } from 'node:http2';
import { UserAuthDataCacheValue } from './cache-helper.mjs';

export interface ConnectedClientData {
    connectionId: number;
    connectedAt: number;
    /**
     * Operator ID in the system
     */
    operatorId?: number | null;
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
}

export interface IsTokenActiveResult {
    isActive: boolean;
    authTokenCacheValue?: UserAuthDataCacheValue;
}

export interface CanProcessOperatorMessageResult {
    canProcess: boolean;
    errorReason?: string;
}
