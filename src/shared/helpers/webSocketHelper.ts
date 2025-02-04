import { igroCehWebSocketBaseUrl } from "../constants";

type WebSocketState = {
    webSocketInstance: WebSocket | null,
    rooms: string[]
}

const state: WebSocketState = {
    webSocketInstance: null,
    rooms: []
}

const waitForOpenConnection = (socket: WebSocket | null): Promise<void> => {
    return new Promise((resolve, reject) => {
        const maxNumberOfAttempts = 10
        const intervalTime = 300 //ms

        let currentAttempt = 0
        const interval = setInterval(() => {
            if (currentAttempt > maxNumberOfAttempts - 1) {
                clearInterval(interval);
                console.log(socket?.readyState);
                reject(new Error('Maximum number of attempts exceeded'))
            } else if (socket?.readyState === socket?.OPEN) {
                clearInterval(interval)
                console.log("opened " + socket?.readyState);
                resolve()
            }
            currentAttempt++
        }, intervalTime)
    })
}

export const ensureConnection = () => {
    while (!state.webSocketInstance || 
        state.webSocketInstance.readyState === WebSocket.CLOSED ||
        state.webSocketInstance.readyState === WebSocket.CLOSING
    ) {
        state.webSocketInstance = new WebSocket(`${igroCehWebSocketBaseUrl}/api/ws`);
    }

    console.log(state.webSocketInstance);
};

export const addRoom = async (roomId: string, listener: any) => {
    ensureConnection();
    if(state.webSocketInstance?.readyState === WebSocket.OPEN){
        const newRoomsList = [...state.rooms];
        if(newRoomsList.indexOf(roomId) === -1) {
            state.webSocketInstance?.send(JSON.stringify({ type: "join", payload: roomId }));
        }
        
        newRoomsList.push(roomId);
        state.rooms = newRoomsList;
        state.webSocketInstance?.addEventListener("message", listener);
    }
};

export const leaveRoom = async (roomId: string, listener: any) => {
    if(state.webSocketInstance && state.webSocketInstance.readyState === WebSocket.OPEN) {
        const newRooms = state.rooms.filter(room => room !== roomId);
        state.rooms = newRooms;
        if(newRooms.indexOf(roomId) === -1) {
            state.webSocketInstance?.send(JSON.stringify({ type: "leave", payload: roomId }));
        }
        
        state.webSocketInstance?.removeEventListener("message", listener);
        if(newRooms.length === 0) {
            state.webSocketInstance.close();
            state.webSocketInstance = null;
            state.rooms = [];
        }
    }
};

export type WebSocketMessage<T> = {
    type: string,
    payload: T
}