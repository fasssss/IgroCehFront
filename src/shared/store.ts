import { configureStore } from "@reduxjs/toolkit";
import { igroCehApiReducer, igroCehApiMiddleware } from "./igroCehApi";

export const store = configureStore({
    reducer: {
        igroCehApi: igroCehApiReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // createGame mutation is called with FormData
                ignoredPaths: [/^igroCehApi\.mutations\.[^.]+\.originalArgs/],
            },
        }).concat(igroCehApiMiddleware),
});

export type RootState = ReturnType<typeof store.getState>
export type Dispatch = typeof store.dispatch
