import { configureStore } from "@reduxjs/toolkit";
import authorizationReducer from "root/features/authorization/authorizationSlice";
import webSocketReducer from './helpers/webSocketSlice';
import { igroCehApiReducer, igroCehApiMiddleware } from "./igroCehApi";

export const store = configureStore({
    reducer: {
        webSocketReducer,
        igroCehApi: igroCehApiReducer,
        authorizationReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }).concat(igroCehApiMiddleware),
});

export type RootState = ReturnType<typeof store.getState>
export type Dispatch = typeof store.dispatch