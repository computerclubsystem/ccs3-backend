import { firstValueFrom } from 'rxjs';

import { createOperatorAuthReplyMessage, OperatorAuthReplyMessage, OperatorAuthRequestMessage } from '@computerclubsystem/types/messages/operators/operator-auth.messages.mjs';
import { OperatorReplyMessageErrorCode } from '@computerclubsystem/types/messages/operators/declarations/error-code.mjs';
import { MessageError } from '@computerclubsystem/types/messages/declarations/message-error.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { OperatorConnectionRoundTripData } from '@computerclubsystem/types/messages/operators/declarations/operator-connection-roundtrip-data.mjs';
import { PermissionName } from '@computerclubsystem/types/entities/declarations/permission-name.mjs';
import { OperatorConnectionEventType } from '@computerclubsystem/types/entities/declarations/operator-connection-event-type.mjs';
import { BusUserAuthReplyMessage, BusUserAuthReplyMessageBody, createBusUserAuthRequestMessage } from '@computerclubsystem/types/messages/bus/bus-operator-auth.messages.mjs';
import { OperatorRequestMessage } from '@computerclubsystem/types/messages/operators/declarations/operator.message.mjs';
import { BusGetLastCompletedShiftReplyMessageBody, createBusGetLastCompletedShiftRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-last-completed-shift.messages.mjs';
import { createOperatorSignInInformationNotificationMessage } from '@computerclubsystem/types/messages/operators/operator-sign-in-information-notification.message.mjs';
import { createBusOperatorConnectionEventNotificationMessage } from '@computerclubsystem/types/messages/bus/bus-operator-connection-event-notification.message.mjs';
import { createOperatorConfigurationNotificationMessage, OperatorConfigurationNotificationMessage } from '@computerclubsystem/types/messages/operators/operator-configuration-notification.message.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { UserAuthDataCacheValue } from 'src/cache-helper.mjs';

export class AuthRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorAuthRequestMessage;
        const sendCantAuthenticateReplyMessage = (): void => {
            const replyMsg = createOperatorAuthReplyMessage();
            replyMsg.body.success = false;
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: OperatorReplyMessageErrorCode.cantAuthenticate,
            }] as MessageError[];
            this.sendReplyMessageToOperator(context, replyMsg, message);
        };

        if (!message?.body) {
            sendCantAuthenticateReplyMessage();
            return;
        }

        if (!this.isWhiteSpace(message.body.token)) {
            const processAuthWithTokenResult = await this.processOperatorAuthRequestWithToken(message, context);
            if (processAuthWithTokenResult.success) {
                this.sendSignInInformationNotificationMessage(context);
            }
            return;
        }

        const isUsernameEmpty = this.isWhiteSpace(message.body.username);
        const isPasswordEmpty = this.isWhiteSpace(message.body.passwordHash);
        if (isUsernameEmpty && isPasswordEmpty) {
            sendCantAuthenticateReplyMessage();
            return;
        }

        const requestMsg = createBusUserAuthRequestMessage();
        requestMsg.body.passwordHash = message.body.passwordHash;
        requestMsg.body.username = message.body.username;
        requestMsg.header.roundTripData = this.createRoundTripDataFromConnectedClientData(context.clientData);
        const busUserAuthReplyMsg = await firstValueFrom(this.publishToOperatorsChannelAndWaitForReply<BusUserAuthReplyMessageBody>(context, requestMsg));
        await this.processBusOperatorAuthReplyMessage(context, busUserAuthReplyMsg, message, message.body.username!);
    }

    private async processOperatorAuthRequestWithToken(
        message: OperatorAuthRequestMessage,
        context: ProcessOperatorRequestMessageContext,
    ): Promise<{ success: boolean, replyMsg: OperatorAuthReplyMessage }> {
        const requestToken = message.body.token!;
        const authReplyMsg = createOperatorAuthReplyMessage();
        const isTokenActiveResult = await this.isTokenActive(requestToken, context.cacheHelper);
        if (!isTokenActiveResult.isActive) {
            // Token is provided but is not active
            context.logger.warn('Authentication request with token failed. The token is not active', context.clientData, message, isTokenActiveResult);
            if (isTokenActiveResult.authTokenCacheValue?.token) {
                await context.cacheHelper.deleteAuthTokenKey(isTokenActiveResult.authTokenCacheValue?.token);
            }
            authReplyMsg.body.success = false;
            authReplyMsg.header.failure = true;
            authReplyMsg.header.errors = [{
                code: OperatorReplyMessageErrorCode.invalidToken,
                description: 'The token provided is no longer valid',
            }] as MessageError[];
            this.sendReplyMessageToOperator(context, authReplyMsg, message);
            if (isTokenActiveResult.authTokenCacheValue) {
                const operatorId = context.clientData.userId || isTokenActiveResult.authTokenCacheValue.userId;
                const note = JSON.stringify({
                    requestToken: requestToken,
                    clientData: context.clientData,
                    authTokenCacheValue: isTokenActiveResult.authTokenCacheValue,
                });
                this.publishOperatorConnectionEventMessage(context, operatorId, OperatorConnectionEventType.usedExpiredToken, note);
            }
            return { success: false, replyMsg: authReplyMsg };
        }
        // The token is active - generate new one and remove the old one
        authReplyMsg.body.success = true;
        const newToken = this.createUUIDString();
        authReplyMsg.body.token = newToken;
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
        // TODO: Get token expiration from configuration
        // The token expiration time is returned in seconds
        authTokenCacheValue.tokenExpiresAt = authTokenCacheValue.setAt + context.tokenExpirationMilliseconds;
        authReplyMsg.body.tokenExpiresAt = authTokenCacheValue.tokenExpiresAt;
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
        this.sendReplyMessageToOperator(context, authReplyMsg, message);
        const configurationMsg = this.createOperatorConfigurationMessage(context);
        this.sendNotificationMessageToOperator(context, configurationMsg);
        const note = JSON.stringify({
            clientData: context.clientData,
            authReplyMsg: authReplyMsg,
        });
        this.publishOperatorConnectionEventMessage(context, operatorId!, OperatorConnectionEventType.tokenAuthSuccess, note);
        return { success: true, replyMsg: authReplyMsg };

    }

    private publishOperatorConnectionEventMessage(
        context: ProcessOperatorRequestMessageContext,
        operatorId: number,
        eventType: OperatorConnectionEventType,
        note?: string
    ): void {
        if (!operatorId) {
            context.logger.warn(`Can't publish operator connection event message. Specified operatorId is null`, context.clientData.ipAddress, eventType, note);
            return;
        }
        const deviceConnectionEventMsg = createBusOperatorConnectionEventNotificationMessage();
        deviceConnectionEventMsg.body.operatorId = operatorId;
        deviceConnectionEventMsg.body.ipAddress = context.clientData.ipAddress;
        deviceConnectionEventMsg.body.type = eventType;
        deviceConnectionEventMsg.body.note = note;
        this.publishToOperatorsChannel(context, deviceConnectionEventMsg);
    }

    private async processBusOperatorAuthReplyMessage(
        context: ProcessOperatorRequestMessageContext,
        busUserAuthReplyMsg: BusUserAuthReplyMessage,
        operatorMessage: OperatorRequestMessage<unknown>,
        username: string,
    ): Promise<OperatorAuthReplyMessage> {
        const replyMsg = createOperatorAuthReplyMessage();
        if (!context.clientData) {
            replyMsg.body.success = false;
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: OperatorReplyMessageErrorCode.cantAuthenticate
            }] as MessageError[];
            this.sendReplyMessageToOperator(context, replyMsg, operatorMessage);
            return replyMsg;
        }
        const rtData = busUserAuthReplyMsg.header.roundTripData! as OperatorConnectionRoundTripData;
        context.clientData.isAuthenticated = busUserAuthReplyMsg.body.success;
        context.clientData.permissions = new Set<PermissionName>(busUserAuthReplyMsg.body.permissions);
        context.clientData.userId = busUserAuthReplyMsg.body.userId;
        replyMsg.body.permissions = busUserAuthReplyMsg.body.permissions;
        replyMsg.body.success = busUserAuthReplyMsg.body.success;
        if (replyMsg.body.success) {
            replyMsg.body.token = this.createUUIDString();
            replyMsg.body.tokenExpiresAt = this.getNowAsNumber() + context.tokenExpirationMilliseconds;
            await this.maintainUserAuthDataTokenCacheItem(context, context.clientData.userId!, context.clientData.connectedAt, replyMsg.body.permissions!, replyMsg.body.token, rtData, username);
        }
        if (!busUserAuthReplyMsg.body.success) {
            replyMsg.body.success = false;
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: OperatorReplyMessageErrorCode.cantAuthenticate,
            }] as MessageError[];
        }
        this.sendReplyMessageToOperator(context, replyMsg, operatorMessage);
        if (busUserAuthReplyMsg.body.success) {
            // Send configuration message
            // TODO: Get configuration from the database
            const configurationMsg = this.createOperatorConfigurationMessage(context);
            this.sendNotificationMessageToOperator(context, configurationMsg);

            const note = JSON.stringify({
                messageBody: busUserAuthReplyMsg.body,
                clientData: context.clientData,
            });
            this.publishOperatorConnectionEventMessage(context, context.clientData.userId!, OperatorConnectionEventType.passwordAuthSuccess, note);
            this.sendSignInInformationNotificationMessage(context);
        }
        return replyMsg;
    }

    private sendSignInInformationNotificationMessage(context: ProcessOperatorRequestMessageContext): void {
        const busGetLastShiftReqMsg = createBusGetLastCompletedShiftRequestMessage();
        this.publishToSharedChannelAndWaitForReply<BusGetLastCompletedShiftReplyMessageBody>(context, busGetLastShiftReqMsg)
            .subscribe(busReplyMsg => {
                const signInInformationNotificationMsg = createOperatorSignInInformationNotificationMessage();
                signInInformationNotificationMsg.body.lastShiftCompletedAt = busReplyMsg.body.shift?.completedAt;
                signInInformationNotificationMsg.body.lastShiftCompletedByUsername = busReplyMsg.body.completedByUsername;
                this.sendNotificationMessageToOperator(context, signInInformationNotificationMsg);
            });
    }

    private async maintainUserAuthDataTokenCacheItem(
        context: ProcessOperatorRequestMessageContext,
        userId: number,
        connectedAt: number,
        permissions: PermissionName[],
        token: string,
        roundtripData: OperatorConnectionRoundTripData,
        username: string,
    ): Promise<void> {
        // TODO: Should we delete the previous cache items ?
        const now = this.getNowAsNumber();
        const authData: UserAuthDataCacheValue = {
            permissions: permissions,
            roundtripData: roundtripData,
            setAt: now,
            token: token,
            // TODO: Get token expiration from configuration
            tokenExpiresAt: now + context.tokenExpirationMilliseconds,
            userId: userId,
            username: username,
            connectedAt: connectedAt,
        };
        const userAuthDataCacheKey = context.cacheHelper.getUserAuthDataKey(userId, roundtripData.connectionInstanceId);
        await context.cacheHelper.setValue(userAuthDataCacheKey, authData);
        const authTokenCacheKey = context.cacheHelper.getUserAuthTokenKey(token);
        await context.cacheHelper.setValue(authTokenCacheKey, authData);
    }

    private createOperatorConfigurationMessage(context: ProcessOperatorRequestMessageContext): OperatorConfigurationNotificationMessage {
        const configurationMsg = createOperatorConfigurationNotificationMessage();
        // TODO: Add other values here
        configurationMsg.body.pingInterval = context.pingInterval;
        return configurationMsg;
    }
}
