import EventEmitter from 'node:events';
import { IncomingMessage } from 'node:http';
import { IncomingHttpHeaders } from 'node:http2';
import * as https from 'node:https';
import { DetailedPeerCertificate, TLSSocket } from 'node:tls';
import { RawData, WebSocket, WebSocketServer } from 'ws';

export class WssServer {
    private wsServer!: WebSocketServer;
    private clientsByInstance = new Map<WebSocket, number>();
    private clientsByConnectionId = new Map<number, WebSocket>();
    private clientConnectionsTotal = 0;
    private connectionId = 0;
    private httpsServer!: https.Server;
    private config!: WssServerConfig;
    private emitter = new EventEmitter();

    start(config: WssServerConfig): void {
        this.config = config;
        this.httpsServer = https.createServer({
            cert: config.cert,
            key: config.key,
            ca: config.caCert,
            // If true, clients must send their certificates
            requestCert: config.requestCert,
            // If true and if the client doesn't provide certificate with the same issuer as ca: config.caCert
            // it will not be able to connect to the server
            rejectUnauthorized: config.rejectUnauthorized,
        });
        this.wsServer = new WebSocketServer({
            server: this.httpsServer,
            // host: '0.0.0.0',
            // port: 30502,
            // 100 Kb
            maxPayload: 100 * 1024,
            backlog: 50,
            // If set to true, keeps clients in .clients
            // clientTracking: false,
            // verifyClient: (info: any) => {
            //     const ggg = info.req.client.getPeerX509Certificate(true);
            // },
        });

        this.wsServer.on('listening', () => this.serverListening());
        // this.wsServer.on('headers', (headers: string[], request: IncomingMessage) => this.clientHeaders(headers, request));
        this.wsServer.on('connection', (webSocket, request) => this.clientConnected(webSocket, request));
        this.wsServer.on('error', (error) => this.serverError(error));
        this.httpsServer.listen(config.port, '0.0.0.0', 50);
    }

    closeConnection(connectionId: number): void {
        const webSocket = this.clientsByConnectionId.get(connectionId);
        if (webSocket) {
            this.closeSocket(webSocket);
            this.removeClient(webSocket);
        }
    }

    getConnectionIds(): number[] {
        const ids: number[] = [];
        this.clientsByConnectionId.forEach((webSocket, key) => ids.push(key));
        return ids;
    }

    sendJSON(message: MessageContent, connectionId: number): number {
        const client = this.clientsByConnectionId.get(connectionId);
        if (!client || client.readyState !== client.OPEN) {
            return 0;
        }

        // const data = this.toBinary(message);
        const data = JSON.stringify(message);
        client.send(data, err => {
            if (err) {
                const sendErrorArgs: SendErrorEventArgs = {
                    connectionId: connectionId,
                    err: err,
                    message: message,
                };
                this.emitter.emit(WssServerEventName.sendError, sendErrorArgs);
            }
        });
        return data.length;
    }

    sendJSONToAll(message: MessageContent): number {
        let bytesSent = 0;
        this.clientsByConnectionId.forEach((webSocket, id) => {
            bytesSent += this.sendJSON(message, id);
        });
        return bytesSent;
    }

    getEmitter(): EventEmitter {
        return this.emitter;
    }

    getHttpsServer(): https.Server {
        return this.httpsServer;
    }

    getWebSocketServer(): WebSocketServer {
        return this.wsServer;
    }

    getWebSocketByConnectionId(connectionId: number): WebSocket | undefined {
        return this.clientsByConnectionId.get(connectionId);
    }

    stop(): void {
        this.wsServer.close();
    }

    // private toBinary(obj: Record<string | number, any>): Uint8Array {
    //     const string = JSON.stringify(obj);
    //     const te = new TextEncoder();
    //     const array = te.encode(string);
    //     return array;
    // }

    // private clientHeaders(headers: string[], request: IncomingMessage): void {
    //     // TODO: Happens before ".on('connect', ...)"
    // }

    private serverListening(): void {
        this.emitter.emit(WssServerEventName.serverListening);
    }

    private serverError(error: Error): void {
        const serverErrorEventArgs: ServerErrorEventArgs = {
            err: error,
        };
        this.emitter.emit(WssServerEventName.serverError, serverErrorEventArgs);
    }

    private clientConnected(webSocket: WebSocket, request: IncomingMessage): void {
        this.clientConnectionsTotal++;
        const socketConnectionId = this.createNewConnectionId();
        this.addNewClient(webSocket, socketConnectionId);

        const tlsSocket = request.socket as TLSSocket;
        const peerCert = tlsSocket.getPeerCertificate(true);
        const clientConnectedEventArgs: ClientConnectedEventArgs = {
            connectionId: socketConnectionId,
            certificate: peerCert,
            ipAddress: request.socket.remoteAddress ?? null,
            headers: request.headers,
        };
        this.emitter.emit(WssServerEventName.clientConnected, clientConnectedEventArgs);
    }

    attachToConnection(connectionId: number): boolean {
        const webSocket = this.clientsByConnectionId.get(connectionId);
        if (!webSocket) {
            return false;
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        webSocket.on('message', (data: RawData, isBinary: boolean) => {
            if (data instanceof Buffer) {
                const args: MessageReceivedEventArgs = {
                    connectionId: connectionId,
                    buffer: data,
                };
                this.emitter.emit(WssServerEventName.messageReceived, args);
            }
        });

        webSocket.on('ping', (data: Buffer) => {
            console.log('ping', data.toString());
        });

        webSocket.on('error', err => {
            this.closeSocket(webSocket);
            this.removeClient(webSocket);
            const args: ConnectionErrorEventArgs = {
                connectionId: connectionId,
                err
            };
            this.emitter.emit(WssServerEventName.connectionError, args);
        });

        webSocket.on('close', (code: number, reason: Buffer) => {
            this.removeClient(webSocket);
            const args: ConnectionClosedEventArgs = {
                connectionId: connectionId,
                code: code,
                reason: reason?.toString(),
            };
            this.emitter.emit(WssServerEventName.connectionClosed, args);
        });

        return true;
    }

    private closeSocket(webSocket: WebSocket): void {
        try {
            // close() does not close the connection immediatelly
            // there is some timeout (about 30 seconds) before "close" event to be emitted after close() is called
            // causing "connection closed" kind of logs to appear 30 seconds after the close() call
            // The remote party receives "close" immediatelly and if the remote party closes the connection, then "close" event happens immediatelly
            webSocket?.close();
            // terminate() will immediately close the socket but will cause error at the other party 
            // "(0x80004005): The remote party closed the WebSocket connection without completing the close handshake"
            // webSocket?.terminate();
        } catch (err) {
            console.error(err);
         }
    }

    private createNewConnectionId(): number {
        this.connectionId++;
        return this.connectionId;
    }

    private addNewClient(webSocket: WebSocket, id: number): void {
        this.clientsByInstance.set(webSocket, id);
        this.clientsByConnectionId.set(id, webSocket);
    }

    private removeClient(webSocket: WebSocket): void {
        const id = this.clientsByInstance.get(webSocket);
        if (!id) {
            return;
        }
        this.clientsByInstance.delete(webSocket);
        this.clientsByConnectionId.delete(id);
    }
}

export interface WssServerConfig {
    cert: string;
    key: string;
    caCert: string;
    port: number;
    requestCert: boolean;
    rejectUnauthorized: boolean;
}

export interface ConnectionEventArgs {
    connectionId: number;
}

export interface ClientConnectedEventArgs extends ConnectionEventArgs {
    certificate: DetailedPeerCertificate;
    headers: IncomingHttpHeaders;
    ipAddress: string | null;
}

export interface MessageReceivedEventArgs extends ConnectionEventArgs {
    buffer: Buffer;
}

export interface ConnectionClosedEventArgs extends ConnectionEventArgs {
    code: number;
    reason?: string | null;
}

export interface ConnectionErrorEventArgs extends ConnectionEventArgs {
    err: Error;
}

export interface ServerErrorEventArgs {
    err: Error;
}

export interface SendErrorEventArgs extends ConnectionEventArgs {
    err: Error;
    message: MessageContent;
}

export type MessageContent = object | Record<string | number, unknown>;

export const WssServerEventName = {
    serverError: 'server-error',
    serverListening: 'server-listening',
    clientConnected: 'client-connected',
    messageReceived: 'message-received',
    connectionClosed: 'connection-closed',
    connectionError: 'connection-error',
    sendError: 'send-error',
} as const;
type WssServerEventNameObject = typeof WssServerEventName;
export type WssServerEventName = WssServerEventNameObject[keyof WssServerEventNameObject];