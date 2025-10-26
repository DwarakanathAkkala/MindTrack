import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Habit {
    id: string;
    title: string;
    icon: string;
    color: string;
    category: string;
    goal: {
        type: 'reps' | 'duration' | 'steps' | 'checklist';
        target: number;
        unit: string;
    };
    repeat: {
        frequency: 'daily' | 'weekly';
        days?: { [key: string]: boolean };
    };
    subtasks: { [id: string]: { text: string; completed: boolean } };
    startDate: string;
    endDate?: string;
    reminderTime?: string;
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