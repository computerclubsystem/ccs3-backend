import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { catchError, filter, finalize, first, Observable, of, timeout } from 'rxjs';

import {
    CreateConnectedRedisClientOptions, RedisCacheClient, RedisClientMessageCallback, RedisPubClient, RedisSubClient,
} from '@computerclubsystem/redis-client';
import { ChannelName } from '@computerclubsystem/types/channels/channel-name.mjs';
import { Message } from '@computerclubsystem/types/messages/declarations/message.mjs';
import { MessageType } from '@computerclubsystem/types/messages/declarations/message-type.mjs';
import { BusDeviceStatusesMessage, DeviceStatus } from '@computerclubsystem/types/messages/bus/bus-device-statuses.message.mjs';
import {
    ClientConnectedEventArgs, ConnectionClosedEventArgs, ConnectionErrorEventArgs,
    MessageReceivedEventArgs, WssServer, WssServerConfig, WssServerEventName, SendErrorEventArgs,
    ServerErrorEventArgs,
} from '@computerclubsystem/websocket-server';
import { OperatorAuthRequestMessage } from '@computerclubsystem/types/messages/operators/operator-auth-request.message.mjs';
import { createBusOperatorAuthRequestMessage } from '@computerclubsystem/types/messages/bus/bus-operator-auth-request.message.mjs';
import { BusOperatorAuthReplyMessage, BusOperatorAuthReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-operator-auth-reply.message.mjs';
import { createBusOperatorConnectionEventMessage } from '@computerclubsystem/types/messages/bus/bus-operator-connection-event.message.mjs';
import { createOperatorAuthReplyMessage } from '@computerclubsystem/types/messages/operators/operator-auth-reply.message.mjs';
import { Logger } from './logger.mjs';
import { IStaticFilesServerConfig, StaticFilesServer } from './static-files-server.mjs';
import { EnvironmentVariablesHelper } from './environment-variables-helper.mjs';
import { OperatorMessage, OperatorNotificationMessage, OperatorReplyMessage } from '@computerclubsystem/types/messages/operators/declarations/operator.message.mjs';
import { OperatorMessageType, OperatorNotificationMessageType } from '@computerclubsystem/types/messages/operators/declarations/operator-message-type.mjs';
import { OperatorConnectionRoundTripData } from '@computerclubsystem/types/messages/operators/declarations/operator-connection-roundtrip-data.mjs';
import { createOperatorConfigurationMessage, OperatorConfigurationMessage } from '@computerclubsystem/types/messages/operators/operator-configuration.message.mjs';
import { OperatorPingRequestMessage } from '@computerclubsystem/types/messages/operators/operator-ping-request.message.mjs';
import { CacheHelper, UserAuthDataCacheValue } from './cache-helper.mjs';
import {
    CanProcessOperatorMessageResult, CanProcessOperatorMessageResultErrorReason, ConnectedClientData,
    ConnectionCleanUpReason, IsTokenActiveResult, MessageStatItem, OperatorConnectorState, OperatorConnectorValidators
} from './declarations.mjs';
import { OperatorRefreshTokenRequestMessage } from '@computerclubsystem/types/messages/operators/operator-refresh-token-request.message.mjs';
import { createOperatorRefreshTokenReplyMessage } from '@computerclubsystem/types/messages/operators/operator-refresh-token-reply.message.mjs';
import { createOperatorNotAuthenticatedMessage } from '@computerclubsystem/types/messages/operators/operator-not-authenticated-reply.message.mjs';
import { OperatorSignOutRequestMessage } from '@computerclubsystem/types/messages/operators/operator-sign-out-request.message.mjs';
import { createOperatorSignOutReplyMessage } from '@computerclubsystem/types/messages/operators/operator-sign-out-reply.message.mjs';
import { AuthorizationHelper } from './authorization-helper.mjs';
import { OperatorGetAllDevicesRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-devices-request.message.mjs';
import { createBusOperatorGetAllDevicesRequestMessage } from '@computerclubsystem/types/messages/bus/bus-operator-get-all-devices-request.message.mjs';
import { SubjectsService } from './subjects.service.mjs';
import { createOperatorGetAllDevicesReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-devices-reply.message.mjs';
import { BusOperatorGetAllDevicesReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-operator-get-all-devices-reply.message.mjs';
import { OperatorGetDeviceByIdRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-device-by-id-request.message.mjs';
import { createBusDeviceGetByIdRequestMessage } from '@computerclubsystem/types/messages/bus/bus-device-get-by-id-request.message.mjs';
import { BusDeviceGetByIdReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-device-get-by-id-reply.message.mjs';
import { createOperatorGetDeviceByIdReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-device-by-id-reply.message.mjs';
import { OperatorUpdateDeviceRequestMessage } from '@computerclubsystem/types/messages/operators/operator-update-device-request.message.mjs';
import { createOperatorUpdateDeviceReplyMessage } from '@computerclubsystem/types/messages/operators/operator-update-device-reply.message.mjs';
import { createBusUpdateDeviceRequestMessage } from '@computerclubsystem/types/messages/bus/bus-update-device-request.message.mjs';
import { BusUpdateDeviceReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-update-device-reply.message.mjs';
import { OperatorGetAllTariffsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-tariffs-request.message.mjs';
import { BusGetAllTariffsReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-get-all-tariffs-reply.message.mjs';
import { createBusGetAllTariffsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-tariffs-request.message.mjs';
import { createOperatorGetAllTariffsReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-tariffs-reply.message.mjs';
import { OperatorCreateTariffRequestMessage } from '@computerclubsystem/types/messages/operators/operator-create-tariff-request.message.mjs';
import { createOperatorCreateTariffReplyMessage } from '@computerclubsystem/types/messages/operators/operator-create-tariff-reply.message.mjs';
import { createBusCreateTariffRequestMessage } from '@computerclubsystem/types/messages/bus/bus-create-tariff-request.message.mjs';
import { BusCreateTariffReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-create-tariff-reply.message.mjs';
import { MessageError } from '@computerclubsystem/types/messages/declarations/message-error.mjs';
import { OperatorReplyMessageErrorCode } from '@computerclubsystem/types/messages/operators/declarations/error-code.mjs';
import { Tariff } from '@computerclubsystem/types/entities/tariff.mjs';
import { TariffValidator } from './tariff-validator.mjs';
import { createOperatorDeviceStatusesNotificationMessage } from '@computerclubsystem/types/messages/operators/operator-device-statuses-notification.message.mjs';
import { OperatorDeviceStatus } from '@computerclubsystem/types/entities/operator-device-status.mjs';
import { OperatorStartDeviceRequestMessage } from '@computerclubsystem/types/messages/operators/operator-start-device-request.message.mjs';
import { createBusStartDeviceRequestMessage } from '@computerclubsystem/types/messages/bus/bus-start-device-request.message.mjs';
import { createOperatorStartDeviceReplyMessage } from '@computerclubsystem/types/messages/operators/operator-start-device-reply.message.mjs';
import { OperatorGetDeviceStatusesRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-device-statuses-request.message.mjs';
import { createOperatorGetDeviceStatusesReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-device-statuses-reply.message.mjs';
import { BusStartDeviceReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-start-device-reply.message.mjs';
import { OperatorGetTariffByIdRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-tariff-by-id-request.message.mjs';
import { ErrorReplyHelper } from './error-reply-helper.mjs';
import { createBusGetTariffByIdRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-tariff-by-id-request.message.mjs';
import { BusGetTariffByIdReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-get-tariff-by-id-reply.message.mjs';
import { createOperatorGetTariffByIdReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-tariff-by-id-reply.message.mjs';
import { OperatorUpdateTariffRequestMessage } from '@computerclubsystem/types/messages/operators/operator-update-tariff-request.message.mjs';
import { createBusUpdateTariffRequestMessage } from '@computerclubsystem/types/messages/bus/bus-update-tariff-request.message.mjs';
import { createOperatorUpdateTariffReplyMessage } from '@computerclubsystem/types/messages/operators/operator-update-tariff-reply.message.mjs';
import { OperatorConnectionEventType } from '@computerclubsystem/types/entities/declarations/operator-connection-event-type.mjs';
import { OperatorGetAllRolesRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-roles-request.message.mjs';
import { BusGetAllRolesReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-get-all-roles-reply.message.mjs';
import { createBusGetAllRolesRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-roles-request.message.mjs';
import { createOperatorGetAllRolesReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-roles-reply.message.mjs';
import { OperatorGetRoleWithPermissionsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-role-with-permissions-request.message.mjs';
import { createBusGetRoleWithPermissionsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-role-with-permissions-request.message.mjs';
import { BusGetRoleWithPermissionsReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-get-role-with-permissions-reply.message.mjs';
import { createOperatorGetRoleWithPermissionsReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-role-with-permissions-reply.message.mjs';
import { OperatorGetAllPermissionsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-permissions-request.message.mjs';
import { createBusGetAllPermissionsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-permissions-request.message.mjs';
import { BusGetAllPermissionsReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-get-all-permissions-reply.message.mjs';
import { createOperatorGetAllPermissionsReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-permissions-reply.message.mjs';
import { OperatorCreateRoleWithPermissionsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-create-role-with-permissions-request.message.mjs';
import { createBusCreateRoleWithPermissionsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-create-role-with-permissions-request.message.mjs';
import { BusCreateRoleWithPermissionsReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-create-role-with-permissions-reply.message.mjs';
import { createOperatorCreateRoleWithPermissionsReplyMessage } from '@computerclubsystem/types/messages/operators/operator-create-role-with-permissions-reply.message.mjs';
import { OperatorUpdateRoleWithPermissionsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-update-role-with-permissions-request.message.mjs';
import { createBusUpdateRoleWithPermissionsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-update-role-with-permissions-request.message.mjs';
import { BusUpdateRoleWithPermissionsReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-update-role-with-permissions-reply.message.mjs';
import { createOperatorUpdateRoleWithPermissionsReplyMessage } from '@computerclubsystem/types/messages/operators/operator-update-role-with-permissions-reply.message.mjs';
import { OperatorGetAllUsersRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-users-request.message.mjs';
import { createBusGetAllUsersRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-users-request.message.mjs';
import { createOperatorGetAllUsersReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-users-reply.message.mjs';
import { BusGetAllUsersReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-get-all-users-reply.message.mjs';
import { OperatorGetUserWithRolesRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-user-with-roles-request.message.mjs';
import { createOperatorGetUserWithRolesReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-user-with-roles-reply.message.mjs';
import { createBusGetUserWithRolesRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-user-with-roles-request.message.mjs';
import { BusGetUserWithRolesReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-get-user-with-roles-reply.message.mjs';
import { OperatorCreateUserWithRolesRequestMessage } from '@computerclubsystem/types/messages/operators/operator-create-user-with-roles-request.message.mjs';
import { createBusCreateUserWithRolesRequestMessage } from '@computerclubsystem/types/messages/bus/bus-create-user-with-roles-request.message.mjs';
import { BusCreateUserWithRolesReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-create-user-with-roles-reply.message.mjs';
import { createOperatorCreateUserWithRolesReplyMessage } from '@computerclubsystem/types/messages/operators/operator-create-user-with-roles-reply.message.mjs';
import { createOperatorNotAuthorizedMessage } from '@computerclubsystem/types/messages/operators/operator-not-authorized-reply.message.mjs';
import { OperatorUpdateUserWithRolesRequestMessage } from '@computerclubsystem/types/messages/operators/operator-update-user-with-roles-request.message.mjs';
import { BusUpdateUserWithRolesReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-update-user-with-roles-reply.message.mjs';
import { createOperatorUpdateUserWithRolesReplyMessage } from '@computerclubsystem/types/messages/operators/operator-update-user-with-roles-reply.message.mjs';
import { createBusUpdateUserWithRolesRequestMessage } from '@computerclubsystem/types/messages/bus/bus-update-user-with-roles-request.message.mjs';
import { OperatorStopDeviceRequestMessage } from '@computerclubsystem/types/messages/operators/operator-stop-device-request.message.mjs';
import { createBusStopDeviceRequestMessage } from '@computerclubsystem/types/messages/bus/bus-stop-device-request.message.mjs';
import { BusStopDeviceReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-stop-device-reply.message.mjs';
import { createOperatorStopDeviceReplyMessage } from '@computerclubsystem/types/messages/operators/operator-stop-device-reply.message.mjs';
import { OperatorTransferDeviceRequestMessage } from '@computerclubsystem/types/messages/operators/operator-transfer-device-request.message.mjs';
import { createBusTransferDeviceRequestMessage } from '@computerclubsystem/types/messages/bus/bus-transfer-device-request.message.mjs';
import { BusTransferDeviceReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-transfer-device-reply.message.mjs';
import { createOperatorTransferDeviceReplyMessage } from '@computerclubsystem/types/messages/operators/operator-transfer-device-reply.message.mjs';
import { BusDeviceConnectivitiesNotificationMessage } from '@computerclubsystem/types/messages/bus/bus-device-connectivities-notification.message.mjs';
import { createOperatorDeviceConnectivitiesNotificationMessage, OperatorDeviceConnectivityItem } from '@computerclubsystem/types/messages/operators/operator-device-connectivities-notification.message.mjs';

export class OperatorConnector {
    private readonly subClient = new RedisSubClient();
    private readonly pubClient = new RedisPubClient();
    private readonly messageBusIdentifier = 'ccs3/operator-connector';
    private logger = new Logger();
    private staticFilesServer?: StaticFilesServer;
    private readonly envVars = new EnvironmentVariablesHelper().createEnvironmentVars();
    private readonly state = this.createState();
    private readonly validators = this.createValidators();
    private readonly cacheClient = new RedisCacheClient();
    private readonly cacheHelper = new CacheHelper();
    private readonly authorizationHelper = new AuthorizationHelper();
    private readonly errorReplyHelper = new ErrorReplyHelper();
    private readonly subjectsService = new SubjectsService();

    private wssServer!: WssServer;
    private wssEmitter!: EventEmitter;
    private connectedClients = new Map<number, ConnectedClientData>();

    processOperatorConnected(args: ClientConnectedEventArgs): void {
        this.logger.log('Operator connected', args);
        const data: ConnectedClientData = {
            connectionId: args.connectionId,
            connectionInstanceId: this.createUUIDString(),
            connectedAt: this.getNowAsNumber(),
            userId: null,
            certificate: args.certificate,
            certificateThumbprint: this.getLowercasedCertificateThumbprint(args.certificate?.fingerprint),
            ipAddress: args.ipAddress,
            lastMessageReceivedAt: null,
            receivedMessagesCount: 0,
            receivedPingMessagesCount: 0,
            sentMessagesCount: 0,
            isAuthenticated: false,
            headers: args.headers,
            permissions: new Set<string>(),
            unauthorizedMessageRequestsCount: 0,
        };
        this.setConnectedClientData(data);
        this.wssServer.attachToConnection(args.connectionId);
    }

    async processOperatorMessage(connectionId: number, message: OperatorMessage<any>): Promise<void> {
        const clientData = this.getConnectedClientData(connectionId);
        if (!clientData) {
            return;
        }

        // TODO: Check counters like clientData.unauthorizedMessageRequestsCount and close the connection if maximum is reached
        if (clientData.unauthorizedMessageRequestsCount > 100) {
            return;
        }

        const canProcessOperatorMessageResult = await this.canProcessOperatorMessage(clientData, message);
        if (!canProcessOperatorMessageResult.canProcess) {
            if (canProcessOperatorMessageResult.errorReason === CanProcessOperatorMessageResultErrorReason.notAuthorized) {
                clientData.unauthorizedMessageRequestsCount++;
            }
            this.logger.log(`Can't process operator message`, canProcessOperatorMessageResult, message, clientData);
            if (canProcessOperatorMessageResult.errorReason === CanProcessOperatorMessageResultErrorReason.tokenExpired
                || canProcessOperatorMessageResult.errorReason === CanProcessOperatorMessageResultErrorReason.tokenNotFound
                || canProcessOperatorMessageResult.errorReason === CanProcessOperatorMessageResultErrorReason.tokenNotProvided
                || canProcessOperatorMessageResult.errorReason === CanProcessOperatorMessageResultErrorReason.messageRequiresAuthentication
            ) {
                // Send not authenticated
                const notAuthenticatedMsg = createOperatorNotAuthenticatedMessage();
                notAuthenticatedMsg.header.correlationId = message.header?.correlationId;
                notAuthenticatedMsg.body.requestedMessageType = message.header?.type;
                notAuthenticatedMsg.header.failure = true;
                notAuthenticatedMsg.header.errors = [{
                    code: OperatorReplyMessageErrorCode.notAuthenticated,
                    description: 'Not authenticated. Sign in to authenticate.',
                }] as MessageError[];
                this.sendReplyMessageToOperator(notAuthenticatedMsg, clientData, message);
            }
            if (canProcessOperatorMessageResult.errorReason === CanProcessOperatorMessageResultErrorReason.notAuthorized) {
                // Send not authorized
                const notAuthorizedMsg = createOperatorNotAuthorizedMessage();
                notAuthorizedMsg.header.correlationId = message.header?.correlationId;
                notAuthorizedMsg.body.requestedMessageType = message.header?.type;
                notAuthorizedMsg.header.failure = true;
                notAuthorizedMsg.header.errors = [{
                    code: OperatorReplyMessageErrorCode.notAuthorized,
                    description: `Not enough permissions to execute ${message.header?.type}.`,
                }] as MessageError[];
                this.sendReplyMessageToOperator(notAuthorizedMsg, clientData, message);
            }
            return;
        }

        clientData.lastMessageReceivedAt = this.getNowAsNumber();
        clientData.receivedMessagesCount++;
        const type = message.header.type;
        switch (type) {
            case OperatorMessageType.transferDeviceRequest:
                this.processTransfrerDeviceRequestMessage(clientData, message as OperatorTransferDeviceRequestMessage);
                break;
            case OperatorMessageType.stopDeviceRequest:
                this.processStopDeviceRequestMessage(clientData, message as OperatorStopDeviceRequestMessage);
                break;
            case OperatorMessageType.updateUserWithRolesRequest:
                this.processUpdateUserWithRolesRequestMessage(clientData, message as OperatorUpdateUserWithRolesRequestMessage);
                break;
            case OperatorMessageType.createUserWithRolesRequest:
                this.processCreateUserWithRolesRequestMessage(clientData, message as OperatorCreateUserWithRolesRequestMessage);
                break;
            case OperatorMessageType.getUserWithRolesRequest:
                this.processGetUserWithRolesRequestMessage(clientData, message as OperatorGetUserWithRolesRequestMessage);
                break;
            case OperatorMessageType.getAllUsersRequest:
                this.processOperatorGetAllUsersRequestMessage(clientData, message as OperatorGetAllUsersRequestMessage);
                break;
            case OperatorMessageType.createRoleWithPermissionsRequest:
                this.processOperatorCreateRoleWithPermissionsRequestMessage(clientData, message as OperatorCreateRoleWithPermissionsRequestMessage);
                break;
            case OperatorMessageType.updateRoleWithPermissionsRequest:
                this.processOperatorUpdateRoleWithPermissionsRequestMessage(clientData, message as OperatorUpdateRoleWithPermissionsRequestMessage);
                break;
            case OperatorMessageType.getAllPermissionsRequest:
                this.processOperatorGetAllPermissionsRequestMessage(clientData, message as OperatorGetAllPermissionsRequestMessage);
                break;
            case OperatorMessageType.getRoleWithPermissionsRequest:
                this.processOperatorGetRoleWithPermissionsRequestMessage(clientData, message as OperatorGetRoleWithPermissionsRequestMessage);
                break;
            case OperatorMessageType.getAllRolesRequest:
                this.processOperatorGetAllRolesRequestMessage(clientData, message as OperatorGetAllRolesRequestMessage);
                break;
            case OperatorMessageType.getDeviceStatusesRequest:
                this.processOperatorGetDeviceStatusesRequestMessage(clientData, message as OperatorGetDeviceStatusesRequestMessage);
                break;
            case OperatorMessageType.startDeviceRequest:
                this.processOperatorStartDeviceRequestMessage(clientData, message as OperatorStartDeviceRequestMessage);
                break;
            case OperatorMessageType.getTariffByIdRequest:
                this.processOperatorGetTariffByIdRequestMessage(clientData, message as OperatorGetTariffByIdRequestMessage);
                break;
            case OperatorMessageType.createTariffRequest:
                this.processOperatorCreateTariffRequestMessage(clientData, message as OperatorCreateTariffRequestMessage);
                break;
            case OperatorMessageType.updateTariffRequest:
                this.processOperatorUpdateTariffRequestMessage(clientData, message as OperatorUpdateTariffRequestMessage);
                break;
            case OperatorMessageType.getAllTariffsRequest:
                this.processOperatorGetAllTariffsRequestMessage(clientData, message as OperatorGetAllTariffsRequestMessage);
                break;
            case OperatorMessageType.updateDeviceRequest:
                this.processOperatorUpdateDeviceRequestMessage(clientData, message as OperatorUpdateDeviceRequestMessage);
                break;
            case OperatorMessageType.getAllDevicesRequest:
                this.processOperatorGetAllDevicesRequestMessage(clientData, message as OperatorGetAllDevicesRequestMessage);
                break;
            case OperatorMessageType.getDeviceByIdRequest:
                this.processOperatorGetDeviceByIdRequestMessage(clientData, message as OperatorGetDeviceByIdRequestMessage);
                break;
            case OperatorMessageType.authRequest:
                this.processOperatorAuthRequestMessage(clientData, message as OperatorAuthRequestMessage);
                break;
            case OperatorMessageType.refreshTokenRequest:
                this.processOperatorRefreshTokenRequestMessage(clientData, message as OperatorRefreshTokenRequestMessage);
                break;
            case OperatorMessageType.signOutRequest:
                this.processOperatorSignOutRequestMessage(clientData, message as OperatorSignOutRequestMessage);
                break;
            case OperatorMessageType.pingRequest:
                clientData.receivedPingMessagesCount++;
                this.processOperatorPingRequestMessage(clientData, message as OperatorPingRequestMessage);
                break;
        }
    }

    processTransfrerDeviceRequestMessage(clientData: ConnectedClientData, message: OperatorTransferDeviceRequestMessage): void {
        const busRequestMsg = createBusTransferDeviceRequestMessage();
        busRequestMsg.body.sourceDeviceId = message.body.sourceDeviceId;
        busRequestMsg.body.targetDeviceId = message.body.targetDeviceId;
        busRequestMsg.body.userId = clientData.userId!;
        this.publishToOperatorsChannelAndWaitForReply<BusTransferDeviceReplyMessageBody>(busRequestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorTransferDeviceReplyMessage();
                operatorReplyMsg.body.sourceDeviceStatus = busReplyMsg.body.sourceDeviceStatus;
                operatorReplyMsg.body.targetDeviceStatus = busReplyMsg.body.targetDeviceStatus;
                this.errorReplyHelper.processBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processStopDeviceRequestMessage(clientData: ConnectedClientData, message: OperatorStopDeviceRequestMessage): void {
        const requestMsg = createBusStopDeviceRequestMessage();
        requestMsg.body.deviceId = message.body.deviceId;
        requestMsg.body.userId = clientData.userId!;
        requestMsg.body.note = message.body.note;
        // TODO: stoppedByCustomer is used by pc-connector to specify if the computer was requested to be stopped by customer
        // requestMsg.body.stoppedByCustomer
        this.publishToOperatorsChannelAndWaitForReply<BusStopDeviceReplyMessageBody>(requestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorStopDeviceReplyMessage();
                operatorReplyMsg.body.deviceStatus = busReplyMsg.body.deviceStatus;
                this.errorReplyHelper.processBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processUpdateUserWithRolesRequestMessage(clientData: ConnectedClientData, message: OperatorUpdateUserWithRolesRequestMessage): void {
        const requestMsg = createBusUpdateUserWithRolesRequestMessage();
        requestMsg.body.user = message.body.user;
        requestMsg.body.roleIds = message.body.roleIds;
        requestMsg.body.passwordHash = message.body.passwordHash;
        this.publishToOperatorsChannelAndWaitForReply<BusUpdateUserWithRolesReplyMessageBody>(requestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorUpdateUserWithRolesReplyMessage();
                operatorReplyMsg.body.user = busReplyMsg.body.user;
                operatorReplyMsg.body.roleIds = busReplyMsg.body.roleIds;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = this.errorReplyHelper.updateUserWithRolesErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processCreateUserWithRolesRequestMessage(clientData: ConnectedClientData, message: OperatorCreateUserWithRolesRequestMessage): void {
        const requestMsg = createBusCreateUserWithRolesRequestMessage();
        requestMsg.body.user = message.body.user;
        requestMsg.body.roleIds = message.body.roleIds;
        requestMsg.body.passwordHash = message.body.passwordHash;
        this.publishToOperatorsChannelAndWaitForReply<BusCreateUserWithRolesReplyMessageBody>(requestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorCreateUserWithRolesReplyMessage();
                operatorReplyMsg.body.user = busReplyMsg.body.user;
                operatorReplyMsg.body.roleIds = busReplyMsg.body.roleIds;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = this.errorReplyHelper.createUserWithRolesErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processGetUserWithRolesRequestMessage(clientData: ConnectedClientData, message: OperatorGetUserWithRolesRequestMessage): void {
        const requestMsg = createBusGetUserWithRolesRequestMessage();
        requestMsg.body.userId = message.body.userId;
        this.publishToOperatorsChannelAndWaitForReply<BusGetUserWithRolesReplyMessageBody>(requestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetUserWithRolesReplyMessage();
                operatorReplyMsg.body.user = busReplyMsg.body.user;
                operatorReplyMsg.body.roleIds = busReplyMsg.body.roleIds;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = this.errorReplyHelper.getUserWithRolesErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorGetAllUsersRequestMessage(clientData: ConnectedClientData, message: OperatorGetAllUsersRequestMessage): void {
        const requestMsg = createBusGetAllUsersRequestMessage();
        this.publishToOperatorsChannelAndWaitForReply<BusGetAllUsersReplyMessageBody>(requestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetAllUsersReplyMessage();
                operatorReplyMsg.body.users = busReplyMsg.body.users;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = this.errorReplyHelper.cantGetAllUsersErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorUpdateRoleWithPermissionsRequestMessage(clientData: ConnectedClientData, message: OperatorUpdateRoleWithPermissionsRequestMessage): void {
        const requestMsg = createBusUpdateRoleWithPermissionsRequestMessage();
        requestMsg.body.role = message.body.role;
        requestMsg.body.permissionIds = message.body.rolePermissionIds;
        this.publishToOperatorsChannelAndWaitForReply<BusUpdateRoleWithPermissionsReplyMessageBody>(requestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorUpdateRoleWithPermissionsReplyMessage();
                operatorReplyMsg.body.role = busReplyMsg.body.role;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = this.errorReplyHelper.cantUpdateRoleWithPermissionsErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorCreateRoleWithPermissionsRequestMessage(clientData: ConnectedClientData, message: OperatorCreateRoleWithPermissionsRequestMessage): void {
        const requestMsg = createBusCreateRoleWithPermissionsRequestMessage();
        requestMsg.body.role = message.body.role;
        requestMsg.body.permissionIds = message.body.rolePermissionIds;
        this.publishToOperatorsChannelAndWaitForReply<BusCreateRoleWithPermissionsReplyMessageBody>(requestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorCreateRoleWithPermissionsReplyMessage();
                operatorReplyMsg.body.role = busReplyMsg.body.role;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = this.errorReplyHelper.cantCreateRoleWithPermissionsErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorGetAllPermissionsRequestMessage(clientData: ConnectedClientData, message: OperatorGetAllRolesRequestMessage): void {
        const requestMsg = createBusGetAllPermissionsRequestMessage();
        this.publishToOperatorsChannelAndWaitForReply<BusGetAllPermissionsReplyMessageBody>(requestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetAllPermissionsReplyMessage();
                operatorReplyMsg.body.permissions = busReplyMsg.body.permissions;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = this.errorReplyHelper.cantGetAllPermissionsErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorGetRoleWithPermissionsRequestMessage(clientData: ConnectedClientData, message: OperatorGetRoleWithPermissionsRequestMessage): void {
        const requestMsg = createBusGetRoleWithPermissionsRequestMessage();
        requestMsg.body.roleId = message.body.roleId;
        this.publishToOperatorsChannelAndWaitForReply<BusGetRoleWithPermissionsReplyMessageBody>(requestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetRoleWithPermissionsReplyMessage();
                operatorReplyMsg.body.allPermissions = busReplyMsg.body.allPermissions;
                operatorReplyMsg.body.role = busReplyMsg.body.role;
                operatorReplyMsg.body.rolePermissionIds = busReplyMsg.body.rolePermissionIds;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = this.errorReplyHelper.cantGetAllRoleWithPermissionsErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorGetAllRolesRequestMessage(clientData: ConnectedClientData, message: OperatorGetAllRolesRequestMessage): void {
        const requestMsg = createBusGetAllRolesRequestMessage();
        this.publishToOperatorsChannelAndWaitForReply<BusGetAllRolesReplyMessageBody>(requestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetAllRolesReplyMessage();
                operatorReplyMsg.body.roles = busReplyMsg.body.roles;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = this.errorReplyHelper.cantGetAllRolesErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorUpdateTariffRequestMessage(clientData: ConnectedClientData, message: OperatorUpdateTariffRequestMessage): void {
        const validateTariffResult = this.validators.tariff.validateTariff(message.body.tariff);
        if (!validateTariffResult.success) {
            const errorReplyMsg = createOperatorUpdateTariffReplyMessage();
            errorReplyMsg.header.failure = true;
            errorReplyMsg.header.errors = [{
                code: OperatorReplyMessageErrorCode.tariffCreationError,
                description: `${validateTariffResult.errorCode}: ${validateTariffResult.errorMessage}`,
            }] as MessageError[];
            this.sendReplyMessageToOperator(errorReplyMsg, clientData, message);
            return;
        }

        const busRequestMsg = createBusUpdateTariffRequestMessage();
        busRequestMsg.body.tariff = message.body.tariff;
        this.publishToOperatorsChannelAndWaitForReply<BusGetTariffByIdReplyMessageBody>(busRequestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorUpdateTariffReplyMessage();
                operatorReplyMsg.body.tariff = busReplyMsg.body.tariff;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = this.errorReplyHelper.getCantUpdateTariffErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorGetTariffByIdRequestMessage(clientData: ConnectedClientData, message: OperatorGetTariffByIdRequestMessage): void {
        // Validate
        const busRequestMsg = createBusGetTariffByIdRequestMessage();
        busRequestMsg.body.tariffId = message.body.tariffId;
        this.publishToOperatorsChannelAndWaitForReply<BusGetTariffByIdReplyMessageBody>(busRequestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetTariffByIdReplyMessage();
                operatorReplyMsg.body.tariff = busReplyMsg.body.tariff;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = this.errorReplyHelper.getCantGetTariffByIdErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorGetDeviceStatusesRequestMessage(clientData: ConnectedClientData, message: OperatorGetDeviceStatusesRequestMessage): void {
        // Simply simulate processing of the last bus notification message about device statuses
        // TODO: This will return old data - for example if it is requested immediatelly after a device was started, it will still return that the device is not started
        if (this.state.lastBusDeviceStatusesMessage) {
            // this.processBusDeviceStatusesMessage(this.state.lastBusDeviceStatusesMessage);
            const clientDataToSendTo = this.getConnectedClientsDataToSendDeviceStatusesMessageTo();
            const currentClientData = clientDataToSendTo.find(x => x.connectionInstanceId === clientData.connectionInstanceId);
            if (currentClientData) {
                // This client is authorized to receive device statuses
                const replyMsg = createOperatorGetDeviceStatusesReplyMessage();
                replyMsg.body.deviceStatuses = this.state.lastBusDeviceStatusesMessage.body.deviceStatuses;
                this.sendReplyMessageToOperator(replyMsg, clientData, message);
            } else {
                // The client is not authorized to receive device statuses
                const replyMsg = createOperatorGetDeviceStatusesReplyMessage();
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: 'not-authorized',
                    description: 'A permission required to execute the operation is not found',
                }] as MessageError[];
            }
        } else {
            // This will barely happen - only if the operator request comes before the state-manager to had a chance to calculate device statuses
            // Usually only on services start and can happen only in very short amount of time (like less than the time to refresh teh device statuses which is 5 seconds by default)
            // If this happens simply do not respond to the operator - it will timeout and will get the next device statuses notification message
        }
    }

    processOperatorStartDeviceRequestMessage(clientData: ConnectedClientData, message: OperatorStartDeviceRequestMessage): void {
        // TODO: Validate
        const busRequestMsg = createBusStartDeviceRequestMessage();
        busRequestMsg.body.deviceId = message.body.deviceId;
        busRequestMsg.body.tariffId = message.body.tariffId;
        busRequestMsg.body.userId = clientData.userId!;
        this.publishToOperatorsChannelAndWaitForReply<BusStartDeviceReplyMessageBody>(busRequestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorStartDeviceReplyMessage();
                operatorReplyMsg.body.deviceStatus = busReplyMsg.body.deviceStatus;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = this.errorReplyHelper.getCantStartTheDeviceErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorCreateTariffRequestMessage(clientData: ConnectedClientData, message: OperatorCreateTariffRequestMessage): void {
        const validateTariffResult = this.validators.tariff.validateTariff(message.body.tariff);
        if (!validateTariffResult.success) {
            const errorReplyMsg = createOperatorCreateTariffReplyMessage();
            errorReplyMsg.header.failure = true;
            errorReplyMsg.header.errors = [{
                code: OperatorReplyMessageErrorCode.tariffCreationError,
                description: `${validateTariffResult.errorCode}: ${validateTariffResult.errorMessage}`,
            }] as MessageError[];
            this.sendReplyMessageToOperator(errorReplyMsg, clientData, message);
            return;
        }
        const requestedTariff: Tariff = message.body.tariff;
        requestedTariff.description = requestedTariff.description?.trim();
        requestedTariff.name = requestedTariff.name.trim();

        const busRequestMsg = createBusCreateTariffRequestMessage();
        busRequestMsg.body.tariff = requestedTariff;
        this.publishToOperatorsChannelAndWaitForReply<BusCreateTariffReplyMessageBody>(busRequestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorCreateTariffReplyMessage();
                operatorReplyMsg.body.tariff = busReplyMsg.body.tariff;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = [{
                        code: OperatorReplyMessageErrorCode.tariffCreationError,
                        description: `Can't create tariff. Check if tariff with the same name already exist`,
                    }] as MessageError[];
                    // TODO: Set error in the response header. For this to work we need to have different request and reply headers
                }
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorGetAllTariffsRequestMessage(clientData: ConnectedClientData, message: OperatorGetAllTariffsRequestMessage): void {
        // TODO: Remove "as any"
        const busRequestMsg = createBusGetAllTariffsRequestMessage(message as any);
        busRequestMsg.header.roundTripData = {
            connectionId: clientData.connectionId,
            connectionInstanceId: clientData.connectionInstanceId,
        } as OperatorConnectionRoundTripData;
        this.publishToOperatorsChannelAndWaitForReply<BusGetAllTariffsReplyMessageBody>(busRequestMsg, clientData)
            .subscribe(busReplyMessage => {
                const operatorReplyMsg = createOperatorGetAllTariffsReplyMessage();
                operatorReplyMsg.body.tariffs = busReplyMessage.body.tariffs;
                if (busReplyMessage.header.failure) {
                    // TODO: Set error in the response header. For this to work we need to have different request and reply headers
                }
                this.sendMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorUpdateDeviceRequestMessage(clientData: ConnectedClientData, message: OperatorUpdateDeviceRequestMessage): void {
        const busRequestMsg = createBusUpdateDeviceRequestMessage();
        busRequestMsg.body.device = message.body.device;
        busRequestMsg.header.roundTripData = {
            connectionId: clientData.connectionId,
            connectionInstanceId: clientData.connectionInstanceId,
        } as OperatorConnectionRoundTripData;
        this.publishToOperatorsChannelAndWaitForReply<BusUpdateDeviceReplyMessageBody>(busRequestMsg, clientData)
            .subscribe(busReplyMessage => {
                const operatorReplyMsg = createOperatorUpdateDeviceReplyMessage();
                operatorReplyMsg.body.device = busReplyMessage.body.device;
                if (busReplyMessage.header.failure) {
                    // TODO: Set error in the response header. For this to work we need to have different request and reply headers
                }
                this.sendMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    async processOperatorGetDeviceByIdRequestMessage(clientData: ConnectedClientData, message: OperatorGetDeviceByIdRequestMessage): Promise<void> {
        const busRequestMsg = createBusDeviceGetByIdRequestMessage();
        busRequestMsg.body.deviceId = message.body.deviceId;
        // TODO: Do we need this roundTripData ? We are now waiting for reply by type
        busRequestMsg.header.roundTripData = {
            connectionId: clientData.connectionId,
            connectionInstanceId: clientData.connectionInstanceId,
        } as OperatorConnectionRoundTripData;
        this.publishToOperatorsChannelAndWaitForReply<BusDeviceGetByIdReplyMessageBody>(busRequestMsg, clientData)
            .subscribe(busReplyMessage => {
                const operatorReplyMsg = createOperatorGetDeviceByIdReplyMessage();
                operatorReplyMsg.body.device = busReplyMessage.body.device;
                this.sendMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    async processOperatorGetAllDevicesRequestMessage(clientData: ConnectedClientData, message: OperatorGetAllDevicesRequestMessage): Promise<void> {
        const busRequestMsg = createBusOperatorGetAllDevicesRequestMessage(message);
        busRequestMsg.header.roundTripData = {
            connectionId: clientData.connectionId,
            connectionInstanceId: clientData.connectionInstanceId,
        } as OperatorConnectionRoundTripData;
        this.publishToOperatorsChannelAndWaitForReply<BusOperatorGetAllDevicesReplyMessageBody>(busRequestMsg, clientData)
            .subscribe(busReplyMessage => {
                const operatorReplyMsg = createOperatorGetAllDevicesReplyMessage();
                operatorReplyMsg.body.devices = busReplyMessage.body.devices;
                this.sendMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    publishToOperatorsChannelAndWaitForReply<TReplyBody>(busMessage: Message<any>, clientData: ConnectedClientData): Observable<Message<TReplyBody>> {
        const messageStatItem: MessageStatItem = {
            sentAt: this.getNowAsNumber(),
            correlationId: busMessage.header.correlationId,
            type: busMessage.header.type,
            completedAt: 0,
            operatorId: clientData.userId,
        };
        if (!busMessage.header.correlationId) {
            busMessage.header.correlationId = this.createUUIDString();
        }
        messageStatItem.correlationId = busMessage.header.correlationId;
        return this.publishToOperatorsChannel(busMessage).pipe(
            filter(msg => msg.header.correlationId === busMessage.header.correlationId),
            first(),
            timeout(this.state.messageBusReplyTimeout),
            catchError(err => {
                messageStatItem.error = err;
                // TODO: This will complete the observable. The subscriber will not know about the error/timeout
                return of();
            }),
            finalize(() => {
                messageStatItem.completedAt = this.getNowAsNumber();
                this.subjectsService.setOperatorsChannelMessageStat(messageStatItem);
            }),
        );
    }

    async processOperatorSignOutRequestMessage(clientData: ConnectedClientData, message: OperatorSignOutRequestMessage): Promise<void> {
        clientData.isAuthenticated = false;
        clientData.permissions = new Set<string>();
        const token = message.header.token!;
        if (this.isWhiteSpace(token)) {
            return;
        }
        const cachedTokenValue = await this.cacheHelper.getAuthTokenValue(token);
        if (!cachedTokenValue) {
            return;
        }
        await this.cacheHelper.deleteAuthTokenKey(cachedTokenValue.token);
        await this.cacheHelper.deleteUserAuthDataKey(cachedTokenValue.userId, cachedTokenValue.roundtripData.connectionInstanceId);
        const replyMsg = createOperatorSignOutReplyMessage();
        // Received and sent is the opposite for the client and the server
        // Recevied for the client are sent by the server
        replyMsg.body.receivedMessagesCount = clientData.sentMessagesCount;
        replyMsg.body.sentMessagesCount = clientData.receivedMessagesCount;
        replyMsg.body.sentPingMessagesCount = clientData.receivedPingMessagesCount;
        replyMsg.body.sessionStart = clientData.connectedAt;
        replyMsg.body.sessionEnd = this.getNowAsNumber();
        this.sendMessageToOperator(replyMsg, clientData, message);
    }

    async processOperatorRefreshTokenRequestMessage(clientData: ConnectedClientData, message: OperatorRefreshTokenRequestMessage): Promise<void> {
        // TODO: This is almost the same as processOperatorAuthRequestWithToken()
        const requestToken = message.body.currentToken;
        const refreshTokenReplyMsg = createOperatorRefreshTokenReplyMessage();
        const isTokenActiveResult = await this.isTokenActive(requestToken);
        if (!isTokenActiveResult.isActive) {
            // Token is provided but is not active
            if (isTokenActiveResult.authTokenCacheValue?.token) {
                await this.cacheHelper.deleteAuthTokenKey(isTokenActiveResult.authTokenCacheValue?.token);
            }
            refreshTokenReplyMsg.body.success = false;
            this.sendMessageToOperator(refreshTokenReplyMsg, clientData, message);
            if (isTokenActiveResult.authTokenCacheValue) {
                const operatorId = clientData.userId || isTokenActiveResult.authTokenCacheValue.userId;
                const note = JSON.stringify({
                    requestToken: requestToken,
                    clientData: clientData,
                    authTokenCacheValue: isTokenActiveResult.authTokenCacheValue,
                });
                this.publishOperatorConnectionEventMessage(operatorId, clientData.ipAddress, OperatorConnectionEventType.refreshTokenFailed, note);
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
            ...this.createRoundTripDataFromConnectedClientData(clientData),
        }
        authTokenCacheValue.roundtripData = mergedRoundTripData;
        authTokenCacheValue.tokenExpiresAt = authTokenCacheValue.setAt + this.getTokenExpirationMilliseconds();
        refreshTokenReplyMsg.body.tokenExpiresAt = authTokenCacheValue.tokenExpiresAt;
        // Delete cache for previous token
        await this.cacheHelper.deleteAuthTokenKey(requestToken);
        await this.cacheHelper.deleteUserAuthDataKey(authTokenCacheValue.userId, prevConnectionInstanceId);
        // Set the new cache items
        await this.cacheHelper.setAuthTokenValue(authTokenCacheValue);
        await this.cacheHelper.setUserAuthData(authTokenCacheValue);
        // Mark operator as authenticated
        clientData.isAuthenticated = true;
        clientData.permissions = new Set<string>(authTokenCacheValue.permissions);
        const operatorId = clientData.userId || authTokenCacheValue.userId;
        clientData.userId = operatorId;
        // Send messages back to the operator
        this.sendMessageToOperator(refreshTokenReplyMsg, clientData, message);
        const note = JSON.stringify({
            clientData: clientData,
            authReplyMsg: refreshTokenReplyMsg,
        });
        this.publishOperatorConnectionEventMessage(operatorId!, clientData.ipAddress, OperatorConnectionEventType.tokenRefreshed, note);
    }

    async processOperatorAuthRequestMessage(clientData: ConnectedClientData, message: OperatorAuthRequestMessage): Promise<void> {
        const sendCantAuthenticateReplyMessage = (): void => {
            const replyMsg = createOperatorAuthReplyMessage();
            replyMsg.body.success = false;
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: OperatorReplyMessageErrorCode.cantAuthenticate,
            }] as MessageError[];
            this.sendReplyMessageToOperator(replyMsg, clientData, message);
        };

        if (!message?.body) {
            sendCantAuthenticateReplyMessage();
            return;
        }

        if (!this.isWhiteSpace(message.body.token)) {
            const isTokenProcessed = await this.processOperatorAuthRequestWithToken(clientData, message);
            return;
        }

        const isUsernameEmpty = this.isWhiteSpace(message.body.username);
        const isPasswordEmpty = this.isWhiteSpace(message.body.passwordHash);
        if (isUsernameEmpty && isPasswordEmpty) {
            sendCantAuthenticateReplyMessage();
            return;
        }

        const requestMsg = createBusOperatorAuthRequestMessage();
        requestMsg.body.passwordHash = message.body.passwordHash;
        requestMsg.body.username = message.body.username;
        requestMsg.header.roundTripData = this.createRoundTripDataFromConnectedClientData(clientData);
        this.publishToOperatorsChannelAndWaitForReply<BusOperatorAuthReplyMessageBody>(requestMsg, clientData)
            .subscribe(busReplyMsg => this.processBusOperatorAuthReplyMessage(clientData, busReplyMsg, message));
    }

    /**
     * 
     * @param clientData 
     * @param message 
     * @returns true if success
     */
    async processOperatorAuthRequestWithToken(clientData: ConnectedClientData, message: OperatorAuthRequestMessage): Promise<boolean> {
        const requestToken = message.body.token!;
        const authReplyMsg = createOperatorAuthReplyMessage();
        const isTokenActiveResult = await this.isTokenActive(requestToken);
        if (!isTokenActiveResult.isActive) {
            // Token is provided but is not active
            this.logger.warn('Authentication request with token failed. The token is not active', clientData, message, isTokenActiveResult);
            if (isTokenActiveResult.authTokenCacheValue?.token) {
                await this.cacheHelper.deleteAuthTokenKey(isTokenActiveResult.authTokenCacheValue?.token);
            }
            authReplyMsg.body.success = false;
            authReplyMsg.header.failure = true;
            authReplyMsg.header.errors = [{
                code: OperatorReplyMessageErrorCode.invalidToken,
                description: 'The token provided is no longer valid',
            }] as MessageError[];
            this.sendReplyMessageToOperator(authReplyMsg, clientData, message);
            if (isTokenActiveResult.authTokenCacheValue) {
                const operatorId = clientData.userId || isTokenActiveResult.authTokenCacheValue.userId;
                const note = JSON.stringify({
                    requestToken: requestToken,
                    clientData: clientData,
                    authTokenCacheValue: isTokenActiveResult.authTokenCacheValue,
                });
                this.publishOperatorConnectionEventMessage(operatorId, clientData.ipAddress, OperatorConnectionEventType.usedExpiredToken, note);
            }
            return false;
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
            ...this.createRoundTripDataFromConnectedClientData(clientData),
        }
        authTokenCacheValue.roundtripData = mergedRoundTripData;
        // TODO: Get token expiration from configuration
        // The token expiration time is returned in seconds
        authTokenCacheValue.tokenExpiresAt = authTokenCacheValue.setAt + this.getTokenExpirationMilliseconds();
        authReplyMsg.body.tokenExpiresAt = authTokenCacheValue.tokenExpiresAt;
        // Delete cache for previous token
        await this.cacheHelper.deleteAuthTokenKey(requestToken);
        await this.cacheHelper.deleteUserAuthDataKey(authTokenCacheValue.userId, prevConnectionInstanceId);
        // Set the new cache items
        await this.cacheHelper.setAuthTokenValue(authTokenCacheValue);
        await this.cacheHelper.setUserAuthData(authTokenCacheValue);
        // Mark operator as authenticated
        clientData.isAuthenticated = true;
        clientData.permissions = new Set<string>(authTokenCacheValue.permissions);
        const operatorId = clientData.userId || authTokenCacheValue.userId;
        clientData.userId = operatorId;
        // Send messages back to the operator
        this.sendReplyMessageToOperator(authReplyMsg, clientData, message);
        const configurationMsg = this.createOperatorConfigurationMessage();
        this.sendMessageToOperator(configurationMsg, clientData, null);
        const note = JSON.stringify({
            clientData: clientData,
            authReplyMsg: authReplyMsg,
        });
        this.publishOperatorConnectionEventMessage(operatorId!, clientData.ipAddress, OperatorConnectionEventType.tokenAuthSuccess, note);
        return true;
    }

    createRoundTripDataFromConnectedClientData(clientData: ConnectedClientData): OperatorConnectionRoundTripData {
        const roundTripData: OperatorConnectionRoundTripData = {
            connectionId: clientData.connectionId,
            connectionInstanceId: clientData.connectionInstanceId
        };
        return roundTripData;
    }

    processOperatorPingRequestMessage(clientData: ConnectedClientData, message: OperatorPingRequestMessage): void {
        // TODO: Do we need to do something on ping ? The lastMessageReceivedAt is already set
    }

    processBusMessageReceived(channelName: string, message: Message<any>): void {
        if (this.isOwnMessage(message)) {
            return;
        }
        this.logger.log('Received channel', channelName, 'message', message.header.type, message);
        switch (channelName) {
            case ChannelName.operators:
                this.processOperatorsBusMessage(message);
            case ChannelName.devices:
                this.processDevicesBusMessage(message);
                break;
            case ChannelName.shared:
                break;
        }
    }

    processOperatorsBusMessage<TBody>(message: Message<TBody>): void {
        this.subjectsService.setOperatorsChannelBusMessageReceived(message);
        const type = message.header.type;
        switch (type) {
            // case MessageType.busOperatorAuthReply:
            //     this.processBusOperatorAuthReplyMessage(message as BusOperatorAuthReplyMessage)
            //     break;
            default:
                // this.logger.log(`Unknown message received`, message);
                break;
        }
    }

    processBusOperatorAuthReplyMessage(clientData: ConnectedClientData, message: BusOperatorAuthReplyMessage, operatorMessage: OperatorMessage<any>): void {
        const replyMsg = createOperatorAuthReplyMessage();
        if (!clientData) {
            replyMsg.body.success = false;
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: OperatorReplyMessageErrorCode.cantAuthenticate
            }] as MessageError[];
            this.sendReplyMessageToOperator(replyMsg, clientData, operatorMessage);
            return;
        }
        const rtData = message.header.roundTripData! as OperatorConnectionRoundTripData;
        clientData.isAuthenticated = message.body.success;
        clientData.permissions = new Set<string>(message.body.permissions);
        clientData.userId = message.body.userId;
        replyMsg.body.permissions = message.body.permissions;
        replyMsg.body.success = message.body.success;
        if (replyMsg.body.success) {
            replyMsg.body.token = this.createUUIDString();
            replyMsg.body.tokenExpiresAt = this.getNowAsNumber() + this.getTokenExpirationMilliseconds();
            this.maintainUserAuthDataTokenCacheItem(clientData.userId!, replyMsg.body.permissions!, replyMsg.body.token, rtData);
        }
        if (!message.body.success) {
            replyMsg.body.success = false;
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: OperatorReplyMessageErrorCode.cantAuthenticate,
            }] as MessageError[];
        }
        this.sendReplyMessageToOperator(replyMsg, clientData, operatorMessage);
        if (message.body.success) {
            // Send configuration message
            // TODO: Get configuration from the database
            const configurationMsg = this.createOperatorConfigurationMessage();
            this.sendMessageToOperator(configurationMsg, clientData, operatorMessage);

            const note = JSON.stringify({
                messageBody: message.body,
                clientData: clientData,
            });
            this.publishOperatorConnectionEventMessage(clientData.userId!, clientData.ipAddress, OperatorConnectionEventType.passwordAuthSuccess, note);
        }
    }

    async canProcessOperatorMessage<TBody>(clientData: ConnectedClientData, message: OperatorMessage<TBody>): Promise<CanProcessOperatorMessageResult> {
        const result: CanProcessOperatorMessageResult = {
            canProcess: false,
        } as CanProcessOperatorMessageResult;
        const msgType = message.header?.type;
        if (this.isWhiteSpace(msgType)) {
            result.canProcess = false;
            result.errorReason = CanProcessOperatorMessageResultErrorReason.messageTypeIsMissing;
            return result;
        }

        // Check if the message can be send anonymously
        const isAnonymousMessage = msgType === OperatorMessageType.authRequest;
        if (!isAnonymousMessage && !clientData.isAuthenticated) {
            // The message can't be processed anonymously and the client is not authenticated
            result.canProcess = false;
            result.errorReason = CanProcessOperatorMessageResultErrorReason.messageRequiresAuthentication;
            return result;
        }

        // Non-anonymous messages must have token - check if it is still valid
        if (!isAnonymousMessage) {
            const token = message.header?.token;
            if (this.isWhiteSpace(token)) {
                // Token is not provided
                result.canProcess = false;
                result.errorReason = CanProcessOperatorMessageResultErrorReason.tokenNotProvided;
                return result;
            }
            const authTokenCacheValue = await this.cacheHelper.getAuthTokenValue(token!);
            if (!authTokenCacheValue) {
                // There is no such token in the cache
                result.canProcess = false;
                result.errorReason = CanProcessOperatorMessageResultErrorReason.tokenNotFound;
                return result;
            }
            if (this.getNowAsNumber() > authTokenCacheValue.tokenExpiresAt) {
                // The token expired
                await this.cacheHelper.deleteAuthTokenKey(token!);
                result.canProcess = false;
                result.errorReason = CanProcessOperatorMessageResultErrorReason.tokenExpired;
                return result;
            }
            // Check permissions
            const isAuthorizedResult = this.authorizationHelper.isAuthorized(clientData.permissions, msgType);
            if (!isAuthorizedResult.authorized) {
                result.canProcess = false;
                result.errorReason = CanProcessOperatorMessageResultErrorReason.notAuthorized;
                return result;
            }
        }
        result.canProcess = true;
        return result;
    }

    processDevicesBusMessage<TBody>(message: Message<TBody>): void {
        const type = message.header.type;
        switch (type) {
            case MessageType.busDeviceConnectivitiesNotification:
                this.processBusDeviceConnectivitiesNotificationMessage(message as BusDeviceConnectivitiesNotificationMessage);
                break;
            case MessageType.busDeviceStatuses:
                this.processBusDeviceStatusesMessage(message as BusDeviceStatusesMessage);
                break;
        }
    }

    processBusDeviceConnectivitiesNotificationMessage(message: BusDeviceConnectivitiesNotificationMessage): void {
        const clientDataToSendTo = this.getConnectedClientsDataToSendDeviceConnectivitiesNotificationMessageTo();
        if (clientDataToSendTo.length > 0) {
            const operatorNotificationMsg = createOperatorDeviceConnectivitiesNotificationMessage();
            const operatorDeviceConnectivityItems = message.body.connectivityItems.map(x => ({
                certificateThumbprint: x.certificateThumbprint,
                connectionsCount: x.connectionsCount,
                lastConnectionSince: x.lastConnectionSince,
                messagesCount: x.messagesCount,
                deviceId: x.deviceId,
                deviceName: x.deviceName,
                lastMessageSince: x.lastMessageSince,
                isConnected: x.isConnected,
            } as OperatorDeviceConnectivityItem));
            operatorNotificationMsg.body.connectivityItems = operatorDeviceConnectivityItems;
            for (const clientData of clientDataToSendTo) {
                try {
                    this.sendNotificationMessageToOperator(operatorNotificationMsg, clientData);
                } catch (err) {
                    this.logger.warn(`Can't send to operator`, clientData, operatorNotificationMsg, err);
                }
            }
        }
    }

    processBusDeviceStatusesMessage(message: BusDeviceStatusesMessage): void {
        // Store the last device statuses bus message so we can send it back to operators on request
        this.state.lastBusDeviceStatusesMessage = message;
        // Send device statuses message to all connected operators that can read this information
        const clientDataToSendTo = this.getConnectedClientsDataToSendDeviceStatusesMessageTo();
        if (clientDataToSendTo.length > 0) {
            const deviceStatuses = message.body.deviceStatuses;
            const deviceStatusesNotificationMsg = createOperatorDeviceStatusesNotificationMessage();
            deviceStatusesNotificationMsg.body.deviceStatuses = deviceStatuses.map(x => this.convertDeviceStatusToOperatorDeviceStatus(x));
            for (const clientData of clientDataToSendTo) {
                try {
                    this.sendNotificationMessageToOperator(deviceStatusesNotificationMsg, clientData);
                } catch (err) {
                    this.logger.warn(`Can't send to operator`, clientData, deviceStatusesNotificationMsg, err);
                }
            }
        }
    }

    getConnectedClientsDataToSendDeviceStatusesMessageTo(): ConnectedClientData[] {
        const clientDataToSendTo: ConnectedClientData[] = [];
        const connections = this.getAllConnectedClientsData();
        for (const connection of connections) {
            const clientData = connection[1];
            if (clientData.isAuthenticated) {
                const isAuthorizedResult = this.authorizationHelper.isAuthorized(clientData.permissions, OperatorNotificationMessageType.deviceStatusesNotification);
                if (isAuthorizedResult.authorized) {
                    clientDataToSendTo.push(clientData);
                }
            }
        }
        return clientDataToSendTo;
    }

    getConnectedClientsDataToSendDeviceConnectivitiesNotificationMessageTo(): ConnectedClientData[] {
        const clientDataToSendTo: ConnectedClientData[] = [];
        const connections = this.getAllConnectedClientsData();
        for (const connection of connections) {
            const clientData = connection[1];
            if (clientData.isAuthenticated) {
                const isAuthorizedResult = this.authorizationHelper.isAuthorized(clientData.permissions, OperatorNotificationMessageType.deviceConnectivitiesNotification);
                if (isAuthorizedResult.authorized) {
                    clientDataToSendTo.push(clientData);
                }
            }
        }
        return clientDataToSendTo;
    }

    convertDeviceStatusToOperatorDeviceStatus(deviceStatus: DeviceStatus): OperatorDeviceStatus {
        const opDeviceStatus: OperatorDeviceStatus = {
            deviceId: deviceStatus.deviceId,
            enabled: deviceStatus.enabled,
            expectedEndAt: deviceStatus.expectedEndAt,
            remainingSeconds: deviceStatus.remainingSeconds,
            started: deviceStatus.started,
            startedAt: deviceStatus.startedAt,
            stoppedAt: deviceStatus.stoppedAt,
            tariff: deviceStatus.tariff,
            totalSum: deviceStatus.totalSum,
            totalTime: deviceStatus.totalTime,
        };
        return opDeviceStatus;
    }

    processOperatorConnectionClosed(args: ConnectionClosedEventArgs): void {
        this.logger.log('Operator connection closed', args);
        // Check if we still have this connection before saving connection event - it might be already removed because of timeout
        const clientData = this.getConnectedClientData(args.connectionId);
        if (clientData?.userId) {
            const note = JSON.stringify({
                args: args,
                clientData: clientData,
            });
            this.publishOperatorConnectionEventMessage(clientData.userId!, clientData.ipAddress!, OperatorConnectionEventType.disconnected, note);
        }
        this.removeClient(args.connectionId);
    }

    processOperatorConnectionError(args: ConnectionErrorEventArgs): void {
        this.logger.log('Operator connection error', args);
        // TODO: Should we close the connection ?
    }

    removeClient(connectionId: number): void {
        this.connectedClients.delete(connectionId);
    }

    publishOperatorConnectionEventMessage(operatorId: number, ipAddress: string | null, eventType: OperatorConnectionEventType, note?: string): void {
        if (!operatorId) {
            this.logger.warn(`Can't publish operator connection event message. Specified operatorId is null`, ipAddress, eventType, note);
            return;
        }
        const deviceConnectionEventMsg = createBusOperatorConnectionEventMessage();
        deviceConnectionEventMsg.body.operatorId = operatorId;
        deviceConnectionEventMsg.body.ipAddress = ipAddress;
        deviceConnectionEventMsg.body.type = eventType;
        deviceConnectionEventMsg.body.note = note;
        this.publishToOperatorsChannel(deviceConnectionEventMsg);
    }

    publishToOperatorsChannel<TBody>(message: Message<TBody>): Observable<Message<any>> {
        message.header.source = this.messageBusIdentifier;
        this.logger.log('Publishing message', ChannelName.operators, message.header.type, message);
        this.pubClient.publish(ChannelName.operators, JSON.stringify(message));
        return this.subjectsService.getOperatorsChannelBusMessageReceived();
    }

    getConnectedClientsDataByOperatorId(operatorId: number): [number, ConnectedClientData][] {
        const result: [number, ConnectedClientData][] = [];
        for (const item of this.getAllConnectedClientsData()) {
            const data = item[1];
            if (data.userId === operatorId) {
                result.push(item);
            }
        }
        return result;
    }

    deserializeWebSocketBufferToMessage<TMessage>(buffer: Buffer): TMessage | null {
        const text = buffer.toString();
        const json = JSON.parse(text);
        return json as TMessage;
    }

    deserializeBusMessageToMessage(text: string): Message<any> | null {
        const json = JSON.parse(text);
        return json as Message<any>;
    }

    isOwnMessage<TBody>(message: Message<TBody>): boolean {
        return (message.header.source === this.messageBusIdentifier);
    }

    getLowercasedCertificateThumbprint(certificateFingerprint: string): string {
        if (!certificateFingerprint) {
            return '';
        }
        return certificateFingerprint.replaceAll(':', '').toLowerCase();
    }

    createOperatorConfigurationMessage(): OperatorConfigurationMessage {
        const configurationMsg = createOperatorConfigurationMessage();
        configurationMsg.body.pingInterval = this.state.pingInterval;
        return configurationMsg;
    }

    processOperatorSendError(args: SendErrorEventArgs): void {
        this.logger.warn('Send error', args);
    }

    processOperatorServerError(args: ServerErrorEventArgs): void {
        this.logger.warn('Server error', args);
    }

    processOperatorServerListening(): void {
        const wssServer = this.wssServer.getWebSocketServer();
        const httpsServer = this.wssServer.getHttpsServer();
        this.logger.log('Operator WebSocket server is listening at', wssServer.address(), ', https server is listening at', httpsServer.address());
    }

    getConnectedClientData(connectionId: number): ConnectedClientData | undefined {
        return this.connectedClients.get(connectionId);
    }

    setConnectedClientData(data: ConnectedClientData): void {
        this.connectedClients.set(data.connectionId, data);
    }

    getAllConnectedClientsData(): [number, ConnectedClientData][] {
        return Array.from(this.connectedClients.entries());
    }

    sendReplyMessageToOperator<TBody>(message: OperatorReplyMessage<TBody>, clientData: ConnectedClientData, requestMessage?: OperatorMessage<any>): void {
        if (requestMessage) {
            message.header.correlationId = requestMessage.header.correlationId;
        }
        if (message.header.failure) {
            message.header.requestType = requestMessage?.header?.type;
        }
        clientData.sentMessagesCount++;
        this.logger.log('Sending reply message to operator connection', clientData.connectionId, message.header.type, message);
        this.wssServer.sendJSON(message, clientData.connectionId);
    }

    sendMessageToOperator<TBody>(message: OperatorMessage<TBody>, clientData: ConnectedClientData, requestMessage: OperatorMessage<any> | null): void {
        if (requestMessage) {
            message.header.correlationId = requestMessage.header.correlationId;
        }
        clientData.sentMessagesCount++;
        this.logger.log('Sending message to operator connection', clientData.connectionId, message.header.type, message);
        this.wssServer.sendJSON(message, clientData.connectionId);
    }

    sendNotificationMessageToOperator<TBody>(message: OperatorNotificationMessage<TBody>, clientData: ConnectedClientData): void {
        clientData.sentMessagesCount++;
        this.logger.log('Sending notification message to operator', clientData, message.header.type, message);
        this.wssServer.sendJSON(message, clientData.connectionId);
    }

    startClientConnectionsMonitor(): void {
        this.state.clientConnectionsMonitorTimerHandle = setInterval(() => this.cleanUpClientConnections(), this.state.cleanUpClientConnectionsInterval);
    }

    async maintainUserAuthDataTokenCacheItem(
        userId: number,
        permissions: string[],
        token: string,
        roundtripData: OperatorConnectionRoundTripData,
    ): Promise<void> {
        // TODO: Should we delete the previous cache items ?
        const now = this.getNowAsNumber();
        const authData: UserAuthDataCacheValue = {
            permissions: permissions,
            roundtripData: roundtripData,
            setAt: now,
            token: token,
            // TODO: Get token expiration from configuration
            tokenExpiresAt: now + this.getTokenExpirationMilliseconds(),
            userId: userId,
        };
        const userAuthDataCacheKey = this.cacheHelper.getUserAuthDataKey(userId, roundtripData.connectionInstanceId);
        await this.cacheClient.setValue(userAuthDataCacheKey, authData);
        const authTokenCacheKey = this.cacheHelper.getAuthTokenKey(token);
        await this.cacheClient.setValue(authTokenCacheKey, authData);
    }

    getTokenExpirationMilliseconds(): number {
        // 30 minutes
        // TODO: Get this from configuration
        return 1800000;
    }

    createUUIDString(): string {
        return randomUUID().toString();
    }

    isWhiteSpace(string?: string): boolean {
        return !(string?.trim());
    }

    getNowAsNumber(): number {
        return Date.now();
    }

    getNowAsIsoString(): string {
        return new Date().toISOString();
    }

    createValidators(): OperatorConnectorValidators {
        const validators: OperatorConnectorValidators = {
            tariff: new TariffValidator(),
        };
        return validators;
    }

    createState(): OperatorConnectorState {
        const state: OperatorConnectorState = {
            // Operator apps must send at least one message each 2 minutes or will be disconnected
            idleTimeout: 120 * 1000,
            // Operator apps must authenticate within 20 seconds after connected or will be disconnected
            authenticationTimeout: 30 * 1000,
            // Operator apps must ping the server each 10 seconds
            pingInterval: 10 * 1000,
            // Each 10 seconds the operator-connector will check operator connections and will close timed-out
            cleanUpClientConnectionsInterval: 10 * 1000,
            // The timeout for message bus messages to reply
            messageBusReplyTimeout: 5 * 1000,
            // Message statistics for operator channel
            operatorChannelMessageStatItems: [],
            clientConnectionsMonitorTimerHandle: undefined,
        };
        return state;
    }

    async isTokenActive(token?: string): Promise<IsTokenActiveResult> {
        const result: IsTokenActiveResult = { isActive: false };
        if (this.isWhiteSpace(token)) {
            // Token is not provided
            result.isActive = false;
            return result;
        }

        const authTokenCacheValue = await this.cacheHelper.getAuthTokenValue(token!);
        if (!authTokenCacheValue) {
            // There is no such token
            result.isActive = false;
            return result;
        }

        const now = this.getNowAsNumber();
        if (now > authTokenCacheValue.tokenExpiresAt) {
            // The token expired
            await this.cacheHelper.deleteAuthTokenKey(token!);
            return { isActive: false, authTokenCacheValue: authTokenCacheValue };
        }

        result.isActive = true;
        result.authTokenCacheValue = authTokenCacheValue;
        return result;
    }

    async start(): Promise<void> {
        this.cacheHelper.initialize(this.cacheClient);
        this.subscribeToSubjects();
        await this.joinMessageBus();
        this.startWebSocketServer();
        this.startClientConnectionsMonitor();
        this.serveStaticFiles();
    }

    subscribeToSubjects(): void {
        this.subjectsService.getOperatorsChannelMessageStat().subscribe(messageStatItem => {
            if (this.state.operatorChannelMessageStatItems.length > 1000) {
                // TODO: Implement ring buffer
                this.state.operatorChannelMessageStatItems.shift();
            }
            this.state.operatorChannelMessageStatItems.push(messageStatItem);
            if (messageStatItem.error) {
                this.logger.error('Message ended with error', messageStatItem);
            }
        });
    }

    processOperatorMessageReceived(args: MessageReceivedEventArgs): void {
        let msg: OperatorMessage<any> | null;
        let type: OperatorMessageType | undefined;
        try {
            msg = this.deserializeWebSocketBufferToMessage(args.buffer);
            type = msg?.header?.type;
            this.logger.log('Received message from operator, connection id', args.connectionId, type, msg);
            if (!type) {
                return;
            }
            try {
                this.processOperatorMessage(args.connectionId, msg!);
            } catch (err) {
                this.logger.warn(`Can't process operator message`, msg, args, err);
                return;
            }
        } catch (err) {
            this.logger.warn(`Can't deserialize operator message`, args, err);
            return;
        }
    }

    async joinMessageBus(): Promise<void> {
        const redisHost = this.envVars.CCS3_REDIS_HOST.value;
        const redisPort = this.envVars.CCS3_REDIS_PORT.value;
        this.logger.log('Using redis host', redisHost, 'and port', redisPort);

        await this.connectSubClient(redisHost, redisPort);
        await this.connectPubClient(redisHost, redisPort);
        await this.connectCacheClient(redisHost, redisPort);
    }

    startWebSocketServer(): void {
        this.wssServer = new WssServer();
        const wssServerConfig: WssServerConfig = {
            cert: readFileSync(this.envVars.CCS3_OPERATOR_CONNECTOR_CERTIFICATE_CRT_FILE_PATH.value).toString(),
            key: readFileSync(this.envVars.CCS3_OPERATOR_CONNECTOR_CERTIFICATE_KEY_FILE_PATH.value).toString(),
            caCert: readFileSync(this.envVars.CCS3_OPERATOR_CONNECTOR_ISSUER_CERTIFICATE_CRT_FILE_PATH.value).toString(),
            port: this.envVars.CCS3_OPERATOR_CONNECTOR_PORT.value,
        };
        this.wssServer.start(wssServerConfig);
        this.wssEmitter = this.wssServer.getEmitter();
        this.wssEmitter.on(WssServerEventName.clientConnected, args => this.processOperatorConnected(args));
        this.wssEmitter.on(WssServerEventName.connectionClosed, args => this.processOperatorConnectionClosed(args));
        this.wssEmitter.on(WssServerEventName.connectionError, args => this.processOperatorConnectionError(args));
        this.wssEmitter.on(WssServerEventName.messageReceived, args => this.processOperatorMessageReceived(args));
        this.wssEmitter.on(WssServerEventName.sendError, args => this.processOperatorSendError(args));
        this.wssEmitter.on(WssServerEventName.serverError, args => this.processOperatorServerError(args));
        this.wssEmitter.on(WssServerEventName.serverListening, () => this.processOperatorServerListening());
        this.logger.log('WebSocket server listening at port', this.envVars.CCS3_OPERATOR_CONNECTOR_PORT.value);
    }

    cleanUpClientConnections(): void {
        const connectionIdsWithCleanUpReason = new Map<number, ConnectionCleanUpReason>();
        const now = this.getNowAsNumber();
        for (const entry of this.connectedClients.entries()) {
            const connectionId = entry[0];
            const data = entry[1];
            // If not authenticated for a long time
            if (!data.isAuthenticated && (now - data.connectedAt) > this.state.authenticationTimeout) {
                connectionIdsWithCleanUpReason.set(connectionId, ConnectionCleanUpReason.authenticationTimeout);
            }
            // Add other conditions
            if (data.lastMessageReceivedAt) {
                if ((now - data.lastMessageReceivedAt) > this.state.idleTimeout) {
                    connectionIdsWithCleanUpReason.set(connectionId, ConnectionCleanUpReason.idleTimeout);
                }
            } else {
                // Never received message at this connection - use the time of connection
                if ((now - data.connectedAt) > this.state.idleTimeout) {
                    connectionIdsWithCleanUpReason.set(connectionId, ConnectionCleanUpReason.noMessagesReceived);
                }
            }
        }

        for (const entry of connectionIdsWithCleanUpReason.entries()) {
            const connectionId = entry[0];
            const clientData = this.getConnectedClientData(connectionId);
            this.logger.warn('Disconnecting client', connectionId, entry[1], clientData);
            if (clientData?.userId) {
                const note = JSON.stringify({
                    connectionId: entry[0],
                    connectionCleanUpReason: entry[1],
                    clientData: clientData,
                });
                this.publishOperatorConnectionEventMessage(clientData.userId, clientData.ipAddress, OperatorConnectionEventType.idleTimeout, note);
            }
            this.removeClient(connectionId);
            this.wssServer.closeConnection(connectionId);
        }
    }

    serveStaticFiles(): void {
        // TODO: The static files server must add "charset=utf-8" to all text-based responses like "text/html;charset=utf-8"
        // TODO: The static files server must return "cache-control" response header. Supporting caching is desirable
        const noStaticFilesServing = this.envVars.CCS3_OPERATOR_CONNECTOR_NO_STATIC_FILES_SERVING.value;
        if (!noStaticFilesServing) {
            const staticFilesPath = this.envVars.CCS3_OPERATOR_CONNECTOR_STATIC_FILES_PATH.value;
            const config = {
                notFoundFile: './index.html',
                path: staticFilesPath,
            } as IStaticFilesServerConfig;
            this.staticFilesServer = new StaticFilesServer(config, this.wssServer.getHttpsServer());
            this.staticFilesServer.start();
            const resolvedStaticFilesPath = this.staticFilesServer.getResolvedPath();
            const staticFilesPathExists = existsSync(resolvedStaticFilesPath);
            if (staticFilesPathExists) {
                this.logger.log('Serving static files from', resolvedStaticFilesPath);
            } else {
                this.logger.warn('Static files path', resolvedStaticFilesPath, 'does not exist');
            }
        }
    }

    async connectSubClient(redisHost: string, redisPort: number): Promise<void> {
        const subClientOptions: CreateConnectedRedisClientOptions = {
            host: redisHost,
            port: redisPort,
            errorCallback: err => this.logger.error('SubClient error', err),
            reconnectStrategyCallback: (retries: number, err: Error) => {
                this.logger.error('SubClient reconnect strategy error', retries, err);
                return 5000;
            },
        };
        const subClientMessageCallback: RedisClientMessageCallback = (channelName, message) => {
            try {
                const messageJson = this.deserializeBusMessageToMessage(message);
                if (messageJson) {
                    this.processBusMessageReceived(channelName, messageJson);
                } else {
                    this.logger.warn('The message', message, 'deserialized to null');
                }
            } catch (err) {
                this.logger.warn('Cannot deserialize channel', channelName, 'message', message, err);
            }
        };
        this.logger.log('SubClient connecting to Redis');
        await this.subClient.connect(subClientOptions, subClientMessageCallback);
        this.logger.log('SubClient connected to Redis');
        await this.subClient.subscribe(ChannelName.shared);
        await this.subClient.subscribe(ChannelName.devices);
        await this.subClient.subscribe(ChannelName.operators);
        this.logger.log('SubClient subscribed to the channels');
    }

    async connectPubClient(redisHost: string, redisPort: number): Promise<void> {
        const pubClientOptions: CreateConnectedRedisClientOptions = {
            host: redisHost,
            port: redisPort,
            errorCallback: err => this.logger.error('PubClient error', err),
            reconnectStrategyCallback: (retries: number, err: Error) => {
                this.logger.error('PubClient reconnect strategy error', retries, err);
                return 5000;
            },
        };
        this.logger.log('PubClient connecting to Redis');
        await this.pubClient.connect(pubClientOptions);
        this.logger.log('PubClient connected to Redis');
    }

    async connectCacheClient(redisHost: string, redisPort: number): Promise<void> {
        const redisCacheClientOptions: CreateConnectedRedisClientOptions = {
            host: redisHost,
            port: redisPort,
            errorCallback: err => this.logger.error('CacheClient error', err),
            reconnectStrategyCallback: (retries: number, err: Error) => {
                this.logger.error('CacheClient reconnect strategy error', retries, err);
                return 5000;
            },
        };
        this.logger.log('CacheClient connecting');
        await this.cacheClient.connect(redisCacheClientOptions);
        this.logger.log('CacheClient connected');
    }

    async terminate(): Promise<void> {
        this.logger.warn('Terminating');
        clearInterval(this.state.clientConnectionsMonitorTimerHandle);
        this.staticFilesServer?.stop();
        this.wssServer.stop();
        await this.subClient.disconnect();
        await this.pubClient.disconnect();
        await this.cacheClient.disconnect();
    }
}
