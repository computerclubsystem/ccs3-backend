import { Observable, Subject } from 'rxjs';

import { MessageStatItem } from './declarations.mjs';
import { Message } from '@computerclubsystem/types/messages/declarations/message.mjs';

export class SubjectsService {
    private readonly devicesChannelBusMessageReceivedSubject = new Subject<Message<any>>();
    private readonly devicesChannelMessageStatSubject = new Subject<MessageStatItem>();

    setDevicesChannelMessageStat(msgStatItem: MessageStatItem): void {
        this.devicesChannelMessageStatSubject.next(msgStatItem);
    }

    getDevicesChannelMessageStat(): Observable<MessageStatItem> {
        return this.devicesChannelMessageStatSubject.asObservable();
    }

    setDevicesChannelBusMessageReceived(message: Message<any>): void {
        this.devicesChannelBusMessageReceivedSubject.next(message);
    }

    getDevicesChannelBusMessageReceived(): Observable<Message<any>> {
        return this.devicesChannelBusMessageReceivedSubject.asObservable();
    }
}
