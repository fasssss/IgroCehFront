import { store } from "../store";
import { closeConnection, establishConnection, updateRooms } from "./webSocketSlice";

const waitForOpenConnection = (socket: WebSocket | null): Promise<void> => {
    return new Promise((resolve, reject) => {
        const maxNumberOfAttempts = 10
        const intervalTime = 200 //ms

        let currentAttempt = 0
        const interval = setInterval(() => {
            if (currentAttempt > maxNumberOfAttempts - 1) {
                clearInterval(interval)
                reject(new Error('Maximum number of attempts exceeded'))
            } else if (socket?.readyState === socket?.OPEN) {
                clearInterval(interval)
                resolve()
            }
            currentAttempt++
        }, intervalTime)
    })
}

export const ensureConnection = () => {
    const state = store.getState().webSocketReducer;
    if(!state.webSocketInstance || state.webSocketInstance.readyState !== WebSocket.OPEN) {
        store.dispatch(establishConnection());
        console.log(state);
    }
};

export const addRoom = async (roomId: string, listener: any) => {
    const state = store.getState().webSocketReducer;

    const newRoomsList = [...state.rooms];
    newRoomsList.push(roomId);
    store.dispatch(updateRooms(newRoomsList))
    
    await waitForOpenConnection(state.webSocketInstance)
    state.webSocketInstance?.send(JSON.stringify({ type: "join", payload: roomId }));
    state.webSocketInstance?.addEventListener("message", listener);
};

export const leaveRoom = async (roomId: string, listener: any) => {
    const state = store.getState().webSocketReducer;
    if(state.webSocketInstance && state.webSocketInstance.readyState === WebSocket.OPEN) {
        if(state.rooms.indexOf(roomId) === -1) {
            return;
        }

        const newRooms = state.rooms.filter(room => room !== roomId);

        await waitForOpenConnection(state.webSocketInstance)
        store.dispatch(updateRooms(newRooms));
        state.webSocketInstance?.send(JSON.stringify({ type: "leave", payload: roomId }));
        state.webSocketInstance?.removeEventListener("message", listener);
        if(newRooms.length === 0) {
            state.webSocketInstance.close();
            store.dispatch(closeConnection());
        }
    }
};
