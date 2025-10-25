import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// We'll expand this type later
interface Habit {
    id: string; // The unique key from Firebase
    title: string;
    color: string;
    icon: string;
}

interface HabitsState {
    habits: Habit[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: HabitsState = {
    habits: [],
    status: 'idle',
};

const habitsSlice = createSlice({
    name: 'habits',
    initialState,
    reducers: {
        setHabits: (state, action: PayloadAction<Habit[]>) => {
            state.habits = action.payload;
            state.status = 'succeeded';
        },
        setHabitsStatus: (state, action: PayloadAction<'idle' | 'loading' | 'succeeded' | 'failed'>) => {
            state.status = action.payload;
        },
    },
});

export const { setHabits, setHabitsStatus } = habitsSlice.actions;
export default habitsSlice.reducer;