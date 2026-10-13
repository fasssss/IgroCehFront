import { useEffect, useLayoutEffect, useRef } from "react";
import { subscribeToRoom, WebSocketMessage } from "root/shared/helpers/webSocketHelper";

// handler always sees fresh props and state, while subscription lives as long as the room stays the same
const useRoomMessages = <TMessage extends WebSocketMessage>(roomId: string, onMessage: (message: TMessage) => void) => {
    const onMessageRef = useRef(onMessage);
    useLayoutEffect(() => {
        onMessageRef.current = onMessage;
    });

    useEffect(() => subscribeToRoom<TMessage>(roomId, {
        onMessage: (message) => onMessageRef.current(message)
    }), [roomId]);
};

export { useRoomMessages }
