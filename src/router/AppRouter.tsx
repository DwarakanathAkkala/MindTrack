import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { LandingPage } from '../pages/LandingPage';
import { DashboardPage } from '../pages/DashboardPage';
import { OnboardingPage } from '../pages/OnboardingPage'
export function AppRouter() {
    // Get the user from our Redux store
    const user = useSelector((state: RootState) => state.auth.user);
    const authStatus = useSelector((state: RootState) => state.auth.status);

    // 1. Get the profile and its loading status
    const userProfile = useSelector((state: RootState) => state.user.profile);
    const profileStatus = useSelector((state: RootState) => state.user.status);

    // 2. Update the loading condition
    if (authStatus === 'loading' || profileStatus === 'loading') {
        return <div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>;
    }

    // 3. Define the destination based on whether onboarding is complete
    let destination = '/dashboard';
    if (user && (!userProfile || !userProfile.onboardingCompleted)) {
        destination = '/onboarding';
    }

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={!user ? <LandingPage /> : <Navigate to={destination} />}
                />
                <Route
                    path="/dashboard"
                    element={user ? <DashboardPage /> : <Navigate to="/" />}
                />
                <Route
                    path="/onboarding"
                    element={user ? <OnboardingPage /> : <Navigate to="/" />}
                />
            </Routes>
        </Router>
    );
}