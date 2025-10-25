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

    // Show a loading indicator while we check for a user
    if (authStatus === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={!user ? <LandingPage /> : <Navigate to="/dashboard" />}
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