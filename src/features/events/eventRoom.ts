import type { WebSocketMessage } from "root/shared/helpers/webSocketHelper";
import type { EventObject, EventRecord, MoveEventToNextStageResponse } from "./eventsApi";

// all realtime updates of one event come through this room
export const eventRoom = (eventId: string) => `event${eventId}`;

export type EventRoomMessage =
    | WebSocketMessage<'addUserToEvent', EventRecord>
    | WebSocketMessage<'removeUserFromEvent', EventRecord>
    | WebSocketMessage<'shuffleUsers', EventRecord[]>
    | WebSocketMessage<'suggestGame', Pick<EventRecord, 'id' | 'game'>>
    | WebSocketMessage<'submitPassing', Pick<EventRecord, 'id' | 'reward'>>
    | WebSocketMessage<'updateEventStage', MoveEventToNextStageResponse>
    | WebSocketMessage<'deleteEvent', { eventId: string }>;

// orders records along the chain "who guesses" -> "for whom", so cards can be shown with arrows between them
export const sortByChain = (records: EventRecord[]) => {
    const remaining = [...records];
    const sorted: EventRecord[] = [];
    while(remaining.length > 0) {
        const previous = sorted[sorted.length - 1];
        const nextIndex = remaining.findIndex(record => record.participant.id === previous?.toUser?.id);
        sorted.push(...remaining.splice(Math.max(nextIndex, 0), 1));
    }

    return sorted;
};

const patchRecord = (event: EventObject, patch: Pick<EventRecord, 'id'> & Partial<EventRecord>) => {
    const record = event.eventRecords.find(item => item.id === patch.id);
    if(record) {
        Object.assign(record, patch);
    }
};

// every message can safely come twice: the initiator of a change gets it as well
export const applyEventRoomMessage = (event: EventObject, message: EventRoomMessage) => {
    switch (message.type) {
        case 'addUserToEvent':
            if(!event.eventRecords.some(item => item.id === message.payload.id)) {
                event.eventRecords.push(message.payload);
            }
            break;
        case 'removeUserFromEvent':
            event.eventRecords = event.eventRecords.filter(item => item.id !== message.payload.id);
            break;
        case 'shuffleUsers':
            event.eventRecords = sortByChain(message.payload);
            break;
        case 'suggestGame':
        case 'submitPassing':
            patchRecord(event, message.payload);
            break;
        case 'updateEventStage':
            event.statusId = message.payload.moveToStage;
            break;
        case 'deleteEvent':
            event.isDeleted = true;
            break;
    }
};
