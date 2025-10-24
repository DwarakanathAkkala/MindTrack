import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from 'firebase/auth';

interface AuthState {
    user: User | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: AuthState = {
    user: null,
    status: 'loading', // Start in a loading state to check for a user
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Action to set the user when they log in
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
            state.status = 'succeeded';
        },
        // Action to clear the user when they log out
        clearUser: (state) => {
            state.user = null;
            state.status = 'succeeded';
        },
    },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;