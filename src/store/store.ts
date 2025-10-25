import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import userReducer from '../features/user/userSlice';
import habitsReducer from '../features/habits/habitsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        habits: habitsReducer
    },
    // This helps avoid errors with non-serializable data from Firebase
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

// Define types for our store and dispatch function
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;