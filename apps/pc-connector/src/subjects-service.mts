import { Observable, Subject } from 'rxjs';

import { MessageStatItem } from './declarations.mjs';
import { Message } from '@computerclubsystem/types/messages/declarations/message.mjs';

export class SubjectsService {
    private readonly devicesChannelBusMessageReceivedSubject = new Subject<Message<unknown>>();
    private readonly messageStatSubject = new Subject<MessageStatItem>();
    private readonly sharedChannelBusMessageReceivedSubject = new Subject<Message<unknown>>();

    setSharedChannelBusMessageReceived(message: Message<unknown>): void {
        this.sharedChannelBusMessageReceivedSubject.next(message);
    }

    getSharedChannelBusMessageReceived(): Observable<Message<unknown>> {
        return this.sharedChannelBusMessageReceivedSubject.asObservable();
    }

    setChannelMessageStat(msgStatItem: MessageStatItem): void {
        this.messageStatSubject.next(msgStatItem);
    }

    getChannelMessageStat(): Observable<MessageStatItem> {
        return this.messageStatSubject.asObservable();
    }

    setDevicesChannelBusMessageReceived(message: Message<unknown>): void {
        this.devicesChannelBusMessageReceivedSubject.next(message);
    }

    getDevicesChannelBusMessageReceived(): Observable<Message<unknown>> {
        return this.devicesChannelBusMessageReceivedSubject.asObservable();
    }
}
