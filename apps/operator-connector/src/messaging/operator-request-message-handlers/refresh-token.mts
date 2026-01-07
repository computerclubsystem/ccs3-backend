import { createOperatorRefreshTokenReplyMessage, OperatorRefreshTokenRequestMessage } from '@computerclubsystem/types/messages/operators/operator-refresh-token.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { OperatorConnectionRoundTripData } from '@computerclubsystem/types/messages/operators/declarations/operator-connection-roundtrip-data.mjs';
import { OperatorConnectionEventType } from '@computerclubsystem/types/entities/declarations/operator-connection-event-type.mjs';
import { createBusOperatorConnectionEventNotificationMessage } from '@computerclubsystem/types/messages/bus/bus-operator-connection-event-notification.message.mjs';
import { PermissionName } from '@computerclubsystem/types/entities/declarations/permission-name.mjs';

export class RefreshTokenRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorRefreshTokenRequestMessage;
        const requestToken = message.body.currentToken;
        const refreshTokenReplyMsg = createOperatorRefreshTokenReplyMessage();
        const isTokenActiveResult = await this.isTokenActive(requestToken, context.cacheHelper);
        if (!isTokenActiveResult.isActive) {
            // Token is provided but is not active
            if (isTokenActiveResult.authTokenCacheValue?.token) {
                await context.cacheHelper.deleteAuthTokenKey(isTokenActiveResult.authTokenCacheValue?.token);
            }
            refreshTokenReplyMsg.body.success = false;
            this.sendReplyMessageToOperator(context, refreshTokenReplyMsg, message);
            if (isTokenActiveResult.authTokenCacheValue) {
                const operatorId = context.clientData.userId || isTokenActiveResult.authTokenCacheValue.userId;
                const note = JSON.stringify({
                    requestToken: requestToken,
                    clientData: context.clientData,
                    authTokenCacheValue: isTokenActiveResult.authTokenCacheValue,
                });
                this.publishOperatorConnectionEventMessage(context, operatorId, context.clientData.ipAddress, OperatorConnectionEventType.refreshTokenFailed, note);
            }
            return;
        }
        // The token is active - generate new one and remove the old one
        refreshTokenReplyMsg.body.success = true;
        const newToken = this.createUUIDString();
        refreshTokenReplyMsg.body.token = newToken;
        const authTokenCacheValue = isTokenActiveResult.authTokenCacheValue!;
        const prevConnectionInstanceId = authTokenCacheValue.roundtripData.connectionInstanceId;
        authTokenCacheValue.token = newToken;
        const now = this.getNowAsNumber();
        authTokenCacheValue.setAt = now;
        const mergedRoundTripData: OperatorConnectionRoundTripData = {
            ...authTokenCacheValue.roundtripData,
            ...this.createRoundTripDataFromConnectedClientData(context.clientData),
        };
        authTokenCacheValue.roundtripData = mergedRoundTripData;
        authTokenCacheValue.tokenExpiresAt = authTokenCacheValue.setAt + context.operatorConnectorState.tokenExpirationMilliseconds;
        refreshTokenReplyMsg.body.tokenExpiresAt = authTokenCacheValue.tokenExpiresAt;
        // Delete cache for previous token
        await context.cacheHelper.deleteAuthTokenKey(requestToken);
        await context.cacheHelper.deleteUserAuthDataKey(authTokenCacheValue.userId, prevConnectionInstanceId);
        // Set the new cache items
        await context.cacheHelper.setAuthTokenValue(authTokenCacheValue);
        await context.cacheHelper.setUserAuthData(authTokenCacheValue);
        // Mark operator as authenticated
        context.clientData.isAuthenticated = true;
        context.clientData.permissions = new Set<PermissionName>(authTokenCacheValue.permissions);
        const operatorId = context.clientData.userId || authTokenCacheValue.userId;
        context.clientData.userId = operatorId;
        // Send messages back to the operator
        this.sendReplyMessageToOperator(context, refreshTokenReplyMsg, message);
        const note = JSON.stringify({
            clientData: context.clientData,
            authReplyMsg: refreshTokenReplyMsg,
        });
        this.publishOperatorConnectionEventMessage(context, operatorId!, context.clientData.ipAddress, OperatorConnectionEventType.tokenRefreshed, note);
    }

    private publishOperatorConnectionEventMessage(context: ProcessOperatorRequestMessageContext, operatorId: number, ipAddress: string | null, eventType: OperatorConnectionEventType, note?: string): void {
        if (!operatorId) {
            context.logger.warn(`Can't publish operator connection event message '${eventType}'. Specified operatorId is null`, ipAddress, note);
            return;
        }
        const deviceConnectionEventMsg = createBusOperatorConnectionEventNotificationMessage();
        deviceConnectionEventMsg.body.operatorId = operatorId;
        deviceConnectionEventMsg.body.ipAddress = ipAddress;
        deviceConnectionEventMsg.body.type = eventType;
        deviceConnectionEventMsg.body.note = note;
        this.publishToOperatorsChannel(context, deviceConnectionEventMsg);
    }
}