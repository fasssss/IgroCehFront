export type WebSocketState = {
    webSocketInstance: WebSocket | null,
    rooms: string[]
}

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

export const addRoom = async (socketState: WebSocketState, roomId: string, listener: any) => {

    waitForOpenConnection(socketState.webSocketInstance);

    if(socketState.webSocketInstance?.readyState === WebSocket.OPEN){
        const newRoomsList = [...socketState.rooms];
        if(newRoomsList.indexOf(roomId) === -1) {
            socketState.webSocketInstance?.send(JSON.stringify({ type: "join", payload: roomId }));
        }
        
        newRoomsList.push(roomId);
        socketState.rooms = newRoomsList;
        socketState.webSocketInstance?.addEventListener("message", listener);
    }
};

export const leaveRoom = async (socketState: WebSocketState, roomId: string, listener: any) => {
    if(socketState && socketState.webSocketInstance?.readyState === WebSocket.OPEN) {
        const newRooms = socketState.rooms.filter(room => room !== roomId);
        socketState.rooms = newRooms;
        if(newRooms.indexOf(roomId) === -1) {
            socketState.webSocketInstance?.send(JSON.stringify({ type: "leave", payload: roomId }));
        }
        
        socketState.webSocketInstance?.removeEventListener("message", listener);
        if(newRooms.length === 0) {
            socketState.webSocketInstance?.close();
            socketState.rooms = [];
        }
    }
};

export type WebSocketMessage<T> = {
    type: string,
    payload: T
}