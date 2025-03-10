import { Shift } from "src/entities/shift.mjs";
import { MessageType } from "../declarations/message-type.mjs";
import { Message } from "../declarations/message.mjs";

export type BusGetLastCompletedShiftRequestMessageBody = object;

export type BusGetLastCompletedShiftRequestMessage = Message<BusGetLastCompletedShiftRequestMessageBody>;

export function createBusGetLastCompletedShiftRequestMessage(): BusGetLastCompletedShiftRequestMessage {
    const msg: BusGetLastCompletedShiftRequestMessage = {
        header: { type: MessageType.busGetLastCompletedShiftRequest },
        body: {},
    };
    return msg;
}

export interface BusGetLastCompletedShiftReplyMessageBody {
    shift?: Shift | null;
    completedByUsername?: string | null;
};

export type BusGetLastCompletedShiftReplyMessage = Message<BusGetLastCompletedShiftReplyMessageBody>;

export function createBusGetLastCompletedShiftReplyMessage(): BusGetLastCompletedShiftReplyMessage {
    const msg: BusGetLastCompletedShiftReplyMessage = {
        header: { type: MessageType.busGetLastCompletedShiftReply },
        body: {},
    };
    return msg;
}