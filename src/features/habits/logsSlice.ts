import { createSlice, } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface LogsState {
    logs: any | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: LogsState = {
    logs: null,
    status: 'idle',
};

const logsSlice = createSlice({
    name: 'logs',
    initialState,
    reducers: {
        setLogs: (state, action: PayloadAction<any | null>) => {
            state.logs = action.payload;
            state.status = 'succeeded';
        },
    },
});

export const { setLogs } = logsSlice.actions;
export default logsSlice.reducer;