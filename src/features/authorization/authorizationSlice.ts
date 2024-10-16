import { createSlice } from "@reduxjs/toolkit"

export type AuthorizationState = {}

const initialState: AuthorizationState = {}

export const authorizationSlice = createSlice({
    name: 'authorization',
    initialState: initialState,
    reducers: {}
});

export const {} = authorizationSlice.actions;

export default authorizationSlice.reducer