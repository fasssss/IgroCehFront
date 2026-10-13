import { igroCehWebSocketBaseUrl } from "root/shared/constants";

export type WebSocketMessage<TType extends string = string, TPayload = unknown> = {
    type: TType,
    payload: TPayload
}

export type RoomSubscription<TMessage extends WebSocketMessage> = {
    onMessage: (message: TMessage) => void,
    // connection was restored after a drop, messages sent meanwhile are lost
    onReconnect?: () => void
}

type Room = {
    socket: WebSocket | null,
    subscriptions: Set<RoomSubscription<WebSocketMessage>>,
    reconnectTimeout?: ReturnType<typeof setTimeout>
}

const RECONNECT_DELAY_MS = 2000;

// every room has its own socket, so rooms connect, fail and reconnect independently of each other
const rooms = new Map<string, Room>();

const connect = (roomId: string, room: Room, isReconnect: boolean) => {
    const socket = new WebSocket(`${igroCehWebSocketBaseUrl}/api/ws/${encodeURIComponent(roomId)}`);
    room.socket = socket;

    socket.addEventListener("open", () => {
        if(isReconnect) {
            room.subscriptions.forEach(subscription => subscription.onReconnect?.());
        }
    });
    socket.addEventListener("message", (event: MessageEvent<string>) => {
        const message: WebSocketMessage = JSON.parse(event.data);
        room.subscriptions.forEach(subscription => subscription.onMessage(message));
    });
    socket.addEventListener("close", () => {
        if(rooms.get(roomId) !== room) return; // room was left on purpose
        room.socket = null;
        room.reconnectTimeout = setTimeout(() => connect(roomId, room, true), RECONNECT_DELAY_MS);
    });
};

// returns function that unsubscribes, socket of the room is closed when its last subscription is gone
export const subscribeToRoom = <TMessage extends WebSocketMessage>(roomId: string, subscription: RoomSubscription<TMessage>) => {
    let room = rooms.get(roomId);
    if(!room) {
        room = { socket: null, subscriptions: new Set() };
        rooms.set(roomId, room);
        connect(roomId, room, false);
    }

    // copy keeps subscriptions unique even when the same handlers are passed twice
    const roomSubscription = { ...subscription } as RoomSubscription<WebSocketMessage>;
    const subscribedRoom = room;
    subscribedRoom.subscriptions.add(roomSubscription);

    return () => {
        subscribedRoom.subscriptions.delete(roomSubscription);
        if(subscribedRoom.subscriptions.size > 0) return;

        rooms.delete(roomId);
        clearTimeout(subscribedRoom.reconnectTimeout);
        subscribedRoom.socket?.close();
    };
};
