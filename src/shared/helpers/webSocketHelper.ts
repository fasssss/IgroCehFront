import { igroCehWebSocketBaseUrl } from "../constants";

type WebSocketState = {
    webSocketInstance: WebSocket | null,
    rooms: string[]
}

export const state: WebSocketState = {
    webSocketInstance: null,
    rooms: []
}

//let retryConnection: any = null;

export let webSocketInstance: WebSocket | null = new WebSocket(`${igroCehWebSocketBaseUrl}/api/ws`);

window.onbeforeunload = () => {
    webSocketInstance?.close();
};

// const onError = () => {
//     retryConnection = setInterval(() => {
//         webSocketInstance?.close();
//         webSocketInstance!.onerror = null;
//         initializeWebSocket()
//     }, 5000)
// };

// const onOpen = () => {
//     clearInterval(retryConnection);
//     setInterval(() => {
//         webSocketInstance?.send(JSON.stringify({ type: "ping", payload: true }));
//     }, 5000);
// }

//webSocketInstance.onerror = onError;
//webSocketInstance.onopen = onOpen;

// const initializeWebSocket = () => {
//  webSocketInstance = new WebSocket(`${igroCehWebSocketBaseUrl}/api/ws`);
// }

const waitForOpenConnection = (socket: WebSocket | null): Promise<void> => {
    return new Promise((resolve, reject) => {
        const maxNumberOfAttempts = 10
        const intervalTime = 200 //ms

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

// export const ensureConnection = () => {
//     if (
//         webSocketInstance.readyState === WebSocket.CLOSED ||
//         webSocketInstance.readyState === WebSocket.CLOSING
//     ) {
//         webSocketInstance.close();
//         window.location.reload();
//     }
// };

export const addRoom = async (roomId: string, listener: any) => {
    //ensureConnection();
    if(webSocketInstance?.readyState !== WebSocket.OPEN){
        webSocketInstance = new WebSocket(`${igroCehWebSocketBaseUrl}/api/ws`);
        waitForOpenConnection(webSocketInstance)
    }

    if(webSocketInstance?.readyState === WebSocket.OPEN){
        const newRoomsList = [...state.rooms];
        if(newRoomsList.indexOf(roomId) === -1) {
            webSocketInstance?.send(JSON.stringify({ type: "join", payload: roomId }));
        }
        
        newRoomsList.push(roomId);
        state.rooms = newRoomsList;
        webSocketInstance?.addEventListener("message", listener);
    }
};

export const leaveRoom = async (roomId: string, listener: any) => {
    if(webSocketInstance && webSocketInstance.readyState === WebSocket.OPEN) {
        const newRooms = state.rooms.filter(room => room !== roomId);
        state.rooms = newRooms;
        if(newRooms.indexOf(roomId) === -1) {
            webSocketInstance?.send(JSON.stringify({ type: "leave", payload: roomId }));
        }
        
        webSocketInstance?.removeEventListener("message", listener);
        if(newRooms.length === 0) {
            webSocketInstance.close();
            state.webSocketInstance = null;
            state.rooms = [];
        }
    }
};

export type WebSocketMessage<T> = {
    type: string,
    payload: T
}