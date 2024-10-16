import { configureStore } from "@reduxjs/toolkit";
import authorizationReducer from "root/features/authorization/authorizationSlice";
import { igroCehApiReducer, igroCehApiMiddleware } from "./igroCehApi";

export const store = configureStore({
    reducer: {
        igroCehApi: igroCehApiReducer,
        authorizationReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(igroCehApiMiddleware),
});

export type RootState = ReturnType<typeof store.getState>
export type Dispatch = typeof store.dispatch