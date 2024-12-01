import { igroCehWebSocketBaseUrl } from "../constants";
import { router } from "../router";

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
        const maxNumberOfAttempts = 20
        const intervalTime = 400 //ms

        let currentAttempt = 0
        const interval = setInterval(() => {
            if (currentAttempt > maxNumberOfAttempts - 1) {
                clearInterval(interval)
                reject(new Error('Maximum number of attempts exceeded'))
                router.navigate(0);
            } else if (socket?.readyState === socket?.OPEN) {
                clearInterval(interval)
                resolve()
            }
            currentAttempt++
        }, intervalTime)
    })
}

export const ensureConnection = () => {
    if(!state.webSocketInstance || state.webSocketInstance.readyState !== WebSocket.OPEN) {
        state.webSocketInstance = new WebSocket(`${igroCehWebSocketBaseUrl}/api/ws`);
    }
};

export const addRoom = async (roomId: string, listener: any) => {
    await waitForOpenConnection(state.webSocketInstance)
    const newRoomsList = [...state.rooms];
    if(newRoomsList.indexOf(roomId) === -1) {
        state.webSocketInstance?.send(JSON.stringify({ type: "join", payload: roomId }));
    }
    
    newRoomsList.push(roomId);
    state.rooms = newRoomsList;
    state.webSocketInstance?.addEventListener("message", listener);
};

export const leaveRoom = async (roomId: string, listener: any) => {
    if(state.webSocketInstance && state.webSocketInstance.readyState === WebSocket.OPEN) {
        const newRooms = state.rooms.filter(room => room !== roomId);
        state.rooms = newRooms;
        console.log(state.webSocketInstance);
        //await waitForOpenConnection(state.webSocketInstance);
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