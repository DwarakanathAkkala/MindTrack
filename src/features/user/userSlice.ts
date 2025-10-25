import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UserProfileState {
    profile: any | null; // We can use 'any' for now, or the specific UserProfile type
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: UserProfileState = {
    profile: null,
    status: 'idle',
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserProfile: (state, action: PayloadAction<any | null>) => {
            state.profile = action.payload;
            state.status = 'succeeded';
        },
        clearUserProfile: (state) => {
            state.profile = null;
            state.status = 'idle';
        },
        setUserProfileStatus: (state, action: PayloadAction<'idle' | 'loading' | 'succeeded' | 'failed'>) => {
            state.status = action.payload;
        },
    },
});

export const { setUserProfile, clearUserProfile, setUserProfileStatus } = userSlice.actions;
export default userSlice.reducer;