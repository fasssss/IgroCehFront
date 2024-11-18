import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { igroCehWebSocketBaseUrl } from "../constants";

export type WebSocketState = {
    webSocketInstance: WebSocket | null,
    rooms: string[]
}

const initialState: WebSocketState = {
    webSocketInstance: null,
    rooms: []
}

export const webSocketSlice = createSlice({
    name: 'webSockets',
    initialState: initialState,
    reducers: {
        establishConnection: (state) => {
            state.webSocketInstance = new WebSocket(`${igroCehWebSocketBaseUrl}/api/ws`)
        },
        updateRooms: (state, action: PayloadAction<string[]>) => {
            state.rooms = action.payload
        },
        closeConnection: (state) => {
            state.webSocketInstance = initialState.webSocketInstance,
            state.rooms = initialState.rooms
        }
    }
});

export const { establishConnection, updateRooms, closeConnection } = webSocketSlice.actions;

export default webSocketSlice.reducer