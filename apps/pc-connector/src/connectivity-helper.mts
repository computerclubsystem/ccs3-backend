import { DetailedPeerCertificate } from 'node:tls';

import { ClientConnectedEventArgs } from '@computerclubsystem/websocket-server';
import { DeviceConnectivityConnectionEventType } from '@computerclubsystem/types/messages/shared-declarations/device-connectivity-connection-event-type.mjs';

export class ConnectivityHelper {
    // Will contain map between certificate thumbprints and statistics about this device
    private connectionItemsMap = new Map<string, DeviceConnectivityConnectionItem>();
    private messageItemsMap = new Map<string, DeviceConnectivityMessageItem>();
    private maxCappedArrayItemsCount = 20;

    setDeviceMessageReceived(certificateThumbprint: string, deviceId?: number | null, deviceName?: string | null): void {
        let mapItem = this.messageItemsMap.get(certificateThumbprint);
        if (!mapItem) {
            mapItem = {
                messagesCount: 1,
                timestamp: this.getNow(),
                certificateThumbprint: certificateThumbprint,
                deviceId: deviceId,
                deviceName: deviceName,
            };
            this.messageItemsMap.set(certificateThumbprint, mapItem);
        } else {
            mapItem.timestamp = this.getNow();
            mapItem.messagesCount++;
            mapItem.deviceId = deviceId;
            mapItem.deviceName ||= deviceName;
        }
    }

    setDeviceDisconnected(certificateThumbprint: string, connectionId: number, connectionInstanceId: string, eventType: DeviceConnectivityConnectionEventType, note: string | null): void {
        const connectionItem = this.connectionItemsMap.get(certificateThumbprint);
        if (connectionItem) {
            connectionItem.isConnected = false;
            const now = this.getNow();
            const connectionEventItem: DeviceConnectivityConnectionEventItem = {
                timestamp: now,
                connectionId: connectionId,
                connectionInstanceId: connectionInstanceId,
                type: eventType,
                note: note,
            };
            this.addItemToCappedArray(connectionItem.connectionEventItems, connectionEventItem, this.maxCappedArrayItemsCount);
        }
    }

    setDeviceConnected(certificateThumbprint: string, args: ClientConnectedEventArgs, connectionInstanceId: string): void {
        let mapItem = this.connectionItemsMap.get(certificateThumbprint);
        const now = this.getNow();
        const connectedEventItem: DeviceConnectivityConnectionEventItem = {
            timestamp: now,
            connectionId: args.connectionId,
            connectionInstanceId: connectionInstanceId,
            type: DeviceConnectivityConnectionEventType.connected,
        };
        if (!mapItem) {
            mapItem = {
                connectionsCount: 1,
                timestamp: now,
                certificateThumbprint: certificateThumbprint,
                certificate: args.certificate,
                isConnected: true,
                connectionEventItems: [],
            };
            this.connectionItemsMap.set(certificateThumbprint, mapItem);
        } else {
            mapItem.timestamp = now;
            mapItem.connectionsCount++;
            mapItem.certificate = args.certificate;
            mapItem.isConnected = true;
        }
        this.addItemToCappedArray(mapItem.connectionEventItems, connectedEventItem, this.maxCappedArrayItemsCount);
    }

    getSnapshot(): DeviceConnectivitySnapshotItem[] {
        const connectivityMap = new Map<string, DeviceConnectivitySnapshotItem>();
        // Iterate connection items map and match message item
        // There will be as much message items as connections (both connection and message items are keyed by certificate thumbrint)
        // It is possible to have connection item but not matched message item (but not the outher way around)
        // because the connection items is created first and then eventually message item for the same certificate thumbprint
        for (const connectionMap of this.connectionItemsMap.entries()) {
            const thumbprint = connectionMap[0];
            const item = connectionMap[1];
            let connectivityItem = connectivityMap.get(thumbprint);
            if (!connectivityItem) {
                connectivityItem = {
                    certificateThumbprint: thumbprint,
                    certificate: item.certificate,
                    connectionsCount: item.connectionsCount,
                    lastConnectionSince: item.timestamp,
                    isConnected: item.isConnected,
                    connectionEventItems: item.connectionEventItems,
                } as DeviceConnectivitySnapshotItem;
                connectivityMap.set(thumbprint, connectivityItem);
            }
            const messageMapItem = this.messageItemsMap.get(thumbprint);
            if (messageMapItem) {
                connectivityItem.deviceId = messageMapItem.deviceId;
                connectivityItem.deviceName = messageMapItem.deviceName;
                connectivityItem.lastMessageSince = messageMapItem.timestamp;
                connectivityItem.messagesCount = messageMapItem.messagesCount || 0;
            }
        }

        const result: DeviceConnectivitySnapshotItem[] = [];
        for (const item of connectivityMap.values()) {
            result.push(item);
        }
        return result;
    }

    private addItemToCappedArray<TItem>(array: TItem[], item: TItem, maxItems: number): void {
        const hasRoomForNewItem = array.length < maxItems;
        if (!hasRoomForNewItem) {
            array.shift();
        }
        array.push(item);
    }

    private getNow(): number {
        return Date.now();
    }
}

export interface DeviceConnectivitySnapshotItem {
    deviceId?: number | null;
    deviceName?: string | null;
    certificateThumbprint: string;
    certificate: DetailedPeerCertificate;
    connectionsCount: number;
    messagesCount: number;
    lastMessageSince?: number | null;
    lastConnectionSince: number;
    isConnected: boolean;
    connectionEventItems: DeviceConnectivityConnectionEventItem[];
}

export interface DeviceConnectivityConnectionEventItem {
    timestamp: number;
    connectionId: number;
    connectionInstanceId: string;
    type: DeviceConnectivityConnectionEventType;
    note?: string | null;
}

interface DeviceConnectivityConnectionItem {
    timestamp: number;
    certificateThumbprint: string;
    certificate: DetailedPeerCertificate;
    connectionsCount: number;
    isConnected: boolean;
    connectionEventItems: DeviceConnectivityConnectionEventItem[];
}

interface DeviceConnectivityMessageItem {
    timestamp: number;
    deviceId?: number | null;
    deviceName?: string | null;
    certificateThumbprint: string;
    messagesCount: number;
}

