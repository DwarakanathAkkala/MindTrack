import { useSelector, useDispatch } from 'react-redux';
import { signOutUser } from '../features/auth/services';
import { clearUser } from '../features/auth/authSlice';
import type { RootState, AppDispatch } from '../store/store';

export function DashboardPage() {
    const dispatch = useDispatch<AppDispatch>();

    // Get the current user from the Redux store
    const user = useSelector((state: RootState) => state.auth.user);

    const handleSignOut = async () => {
        await signOutUser();
        // After signing out from Firebase, we clear the user from our Redux store.
        // Our AuthListener will also fire and dispatch this, but doing it here
        // provides a more immediate UI update.
        dispatch(clearUser());
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center landing-card">

                <h1 className="title">
                    Welcome, {user?.displayName || 'User'}!
                </h1>

                <p className="subtitle">
                    You have successfully logged in.
                    <br />
                    Your email is: {user?.email}
                </p>

                <div className="pt-4">
                    <button className="btn-secondary" onClick={handleSignOut}>
                        Sign Out
                    </button>
                </div>

            </div>
        </div>
    );
}