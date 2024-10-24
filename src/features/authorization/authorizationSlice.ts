import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export type AuthorizationState = {
    userName: string | null,
    email: string | null,
    avatarUrl: string | null
}

const initialState: AuthorizationState = {
    userName: null,
    email: null,
    avatarUrl: null
}

export const authorizationSlice = createSlice({
    name: 'authorization',
    initialState: initialState,
    reducers: {
        setUserObject: (state, action: PayloadAction<AuthorizationState>) => {
            state.userName = action.payload.userName,
            state.email = action.payload.email,
            state.avatarUrl = action.payload.avatarUrl
        }
    }
});

export const { setUserObject } = authorizationSlice.actions;

export default authorizationSlice.reducer