import { randomUUID } from 'node:crypto';
import { catchError, filter, finalize, first, Observable, of, timeout } from 'rxjs';

import { ChannelName } from '@computerclubsystem/types/channels/channel-name.mjs';
import { Message } from '@computerclubsystem/types/messages/declarations/message.mjs';
import { OperatorConnectionRoundTripData } from '@computerclubsystem/types/messages/operators/declarations/operator-connection-roundtrip-data.mjs';
import { OperatorNotificationMessage, OperatorReplyMessage, OperatorRequestMessage } from '@computerclubsystem/types/messages/operators/declarations/operator.message.mjs';
import { ConnectedClientData, IsTokenActiveResult, MessageStatItem } from 'src/declarations.mjs';
import { ProcessOperatorRequestMessageContext } from './declarations.mjs';
import { CacheHelper } from 'src/cache-helper.mjs';

export class MessageHandlerBase {
    publishToDevicesChannelAndWaitForReply<TReplyBody>(
        context: ProcessOperatorRequestMessageContext,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        busMessage: Message<any>,
    ): Observable<Message<TReplyBody>> {
        const messageStatItem: MessageStatItem = {
            sentAt: this.getNowAsNumber(),
            channel: ChannelName.devices,
            correlationId: busMessage.header.correlationId,
            type: busMessage.header.type,
            completedAt: 0,
            operatorId: context.clientData.userId,
        };
        if (!busMessage.header.correlationId) {
            busMessage.header.correlationId = this.createUUIDString();
        }
        messageStatItem.correlationId = busMessage.header.correlationId;
        return this.publishToDevicesChannel(context, busMessage).pipe(
            filter(msg => !!msg.header.correlationId && msg.header.correlationId === busMessage.header.correlationId),
            first(),
            timeout(context.messageBusReplyTimeout),
            catchError(err => {
                messageStatItem.error = err;
                // TODO: This will complete the observable. The subscriber will not know about the error/timeout
                return of();
            }),
            finalize(() => {
                messageStatItem.completedAt = this.getNowAsNumber();
                context.subjectsService.setMessageStat(messageStatItem);
            }),
        );
    }

    publishToOperatorsChannelAndWaitForReply<TReplyBody>(
        context: ProcessOperatorRequestMessageContext,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        busMessage: Message<any>,
    ): Observable<Message<TReplyBody>> {
        const messageStatItem: MessageStatItem = {
            sentAt: this.getNowAsNumber(),
            channel: ChannelName.operators,
            correlationId: busMessage.header.correlationId,
            type: busMessage.header.type,
            completedAt: 0,
            operatorId: context.clientData.userId,
        };
        if (!busMessage.header.correlationId) {
            busMessage.header.correlationId = this.createUUIDString();
        }
        messageStatItem.correlationId = busMessage.header.correlationId;
        return this.publishToOperatorsChannel(context, busMessage).pipe(
            filter(msg => !!msg.header.correlationId && msg.header.correlationId === busMessage.header.correlationId),
            first(),
            timeout(context.messageBusReplyTimeout),
            catchError(err => {
                messageStatItem.error = err;
                // TODO: This will complete the observable. The subscriber will not know about the error/timeout
                return of();
            }),
            finalize(() => {
                messageStatItem.completedAt = this.getNowAsNumber();
                context.subjectsService.setMessageStat(messageStatItem);
            }),
        );
    }

    publishToSharedChannelAndWaitForReply<TReplyBody>(
        context: ProcessOperatorRequestMessageContext,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        busMessage: Message<any>,
    ): Observable<Message<TReplyBody>> {
        const messageStatItem: MessageStatItem = {
            sentAt: this.getNowAsNumber(),
            channel: ChannelName.shared,
            correlationId: busMessage.header.correlationId,
            type: busMessage.header.type,
            completedAt: 0,
            operatorId: context.clientData?.userId,
        };
        if (!busMessage.header.correlationId) {
            busMessage.header.correlationId = this.createUUIDString();
        }
        messageStatItem.correlationId = busMessage.header.correlationId;
        return this.publishToSharedChannel(context, busMessage).pipe(
            filter(msg => !!msg.header.correlationId && msg.header.correlationId === busMessage.header.correlationId),
            first(),
            timeout(context.messageBusReplyTimeout),
            catchError(err => {
                messageStatItem.error = err;
                // TODO: This will complete the observable. The subscriber will not know about the error/timeout
                return of();
            }),
            finalize(() => {
                messageStatItem.completedAt = this.getNowAsNumber();
                context.subjectsService.setMessageStat(messageStatItem);
            }),
        );
    }

    publishToDevicesChannel<TBody>(
        context: ProcessOperatorRequestMessageContext,
        message: Message<TBody>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Observable<Message<any>> {
        message.header.source = context.messageBusIdentifier;
        context.logger.log(`Publishing message '${message.header.type}' to channel ${ChannelName.devices}`, message);
        context.publishClient.publish(ChannelName.devices, JSON.stringify(message));
        return context.subjectsService.getDevicesChannelBusMessageReceived();
    }

    publishToSharedChannel<TBody>(
        context: ProcessOperatorRequestMessageContext,
        message: Message<TBody>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Observable<Message<any>> {
        message.header.source = context.messageBusIdentifier;
        context.logger.log(`Publishing message '${message.header.type}' to channel ${ChannelName.shared}`, message);
        context.publishClient.publish(ChannelName.shared, JSON.stringify(message));
        return context.subjectsService.getSharedChannelBusMessageReceived();
    }

    createRoundTripDataFromConnectedClientData(clientData: ConnectedClientData): OperatorConnectionRoundTripData {
        const roundTripData: OperatorConnectionRoundTripData = {
            connectionId: clientData.connectionId,
            connectionInstanceId: clientData.connectionInstanceId
        };
        return roundTripData;
    }

    publishToOperatorsChannel<TBody>(
        context: ProcessOperatorRequestMessageContext,
        message: Message<TBody>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Observable<Message<any>> {
        message.header.source = context.messageBusIdentifier;
        context.logger.log(`Publishing message '${message.header.type}' to channel ${ChannelName.operators}`, message);
        context.publishClient.publish(ChannelName.operators, JSON.stringify(message));
        return context.subjectsService.getOperatorsChannelBusMessageReceived();
    }

    sendNotificationMessageToOperator<TBody>(
        context: ProcessOperatorRequestMessageContext,
        message: OperatorNotificationMessage<TBody>,
    ): void {
        context.clientData.sentMessagesCount++;
        context.logger.log(`Sending notification message '${message.header.type}' to operator`, context.clientData, message);
        context.wssServer.sendJSON(message, context.clientData.connectionId);
    }

    sendNotificationMessageToOperatorByClientData<TBody>(
        context: ProcessOperatorRequestMessageContext,
        clientData: ConnectedClientData,
        message: OperatorNotificationMessage<TBody>,
    ): void {
        clientData.sentMessagesCount++;
        context.logger.log(`Sending notification message '${message.header.type}' to operator`, clientData, message);
        context.wssServer.sendJSON(message, clientData.connectionId);
    }

    sendReplyMessageToOperator<TBody>(
        context: ProcessOperatorRequestMessageContext,
        message: OperatorReplyMessage<TBody>,
        requestMessage?: OperatorRequestMessage<unknown>
    ): void {
        if (requestMessage) {
            message.header.correlationId = requestMessage.header.correlationId;
        }
        if (message.header.failure) {
            message.header.requestType = requestMessage?.header?.type;
        }
        context.clientData.sentMessagesCount++;
        context.logger.log(`Sending reply message '${message.header.type}' to operator connection`, context.clientData.connectionId, message);
        context.wssServer.sendJSON(message, context.clientData.connectionId);
    }

    // TODO: Extract this method outside the message handler base class
    async isTokenActive(token: string | undefined | null, cacheHelper: CacheHelper): Promise<IsTokenActiveResult> {
        const result: IsTokenActiveResult = { isActive: false };
        if (this.isWhiteSpace(token)) {
            // Token is not provided
            result.isActive = false;
            return result;
        }

        const authTokenCacheValue = await cacheHelper.getAuthTokenValue(token!);
        if (!authTokenCacheValue) {
            // There is no such token
            result.isActive = false;
            return result;
        }

        const now = this.getNowAsNumber();
        if (now > authTokenCacheValue.tokenExpiresAt) {
            // The token expired
            await cacheHelper.deleteAuthTokenKey(token!);
            return { isActive: false, authTokenCacheValue: authTokenCacheValue };
        }

        result.isActive = true;
        result.authTokenCacheValue = authTokenCacheValue;
        return result;
    }

    getNowAsNumber(): number {
        return Date.now();
    }

    createUUIDString(): string {
        return randomUUID().toString();
    }

    isWhiteSpace(string: string | undefined | null): boolean {
        return !(string?.trim());
    }
}
