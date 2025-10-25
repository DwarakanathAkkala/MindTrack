import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { useDispatch } from 'react-redux';
import { setUser } from '../authSlice';
import { setUserProfile, setUserProfileStatus } from '../../user/userSlice';
import { getUserProfile } from '../../user/services';
import type { AppDispatch } from '../../../store/store';

// This component will have no UI, it only runs logic.
// We pass 'children' so we can wrap our app with it.
export function AuthListener({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is logged in
                dispatch(setUser(user));
                dispatch(setUserProfileStatus('loading'));
                const profile = await getUserProfile(user.uid);
                dispatch(setUserProfile(profile)); // This will be null for new users
            } else {
                // User is logged out
                dispatch(setUser(null));
                dispatch(setUserProfile(null));
            }
        });

        return () => unsubscribe();
    }, [dispatch]); // The effect depends on the dispatch function

    return <>{children}</>;
}