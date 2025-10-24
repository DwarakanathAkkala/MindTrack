import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { useDispatch } from 'react-redux';
import { setUser } from '../authSlice';
import type { AppDispatch } from '../../../store/store';

// This component will have no UI, it only runs logic.
// We pass 'children' so we can wrap our app with it.
export function AuthListener({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        // onAuthStateChanged is a Firebase function that listens for login/logout events.
        // It also runs ONCE when the app first loads.
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            // If a user object exists, they are logged in.
            // If it's null, they are logged out.
            // This will be dispatched on initial load, changing the status from 'loading' to 'succeeded'.
            dispatch(setUser(user));
        });

        // The cleanup function will run when the component unmounts
        return () => unsubscribe();
    }, [dispatch]); // The effect depends on the dispatch function

    return <>{children}</>;
}