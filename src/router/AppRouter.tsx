import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import type { RootState } from '../store/store';

// Pages
import { LandingPage } from '../pages/LandingPage';
import { DashboardPage, DashboardSidebar } from '../pages/DashboardPage';
import { OnboardingPage } from '../pages/OnboardingPage';
import { InsightsPage } from '../pages/InsightsPage';
import { ProfilePage } from '../pages/ProfilePage';
import { SharePage } from '../pages/SharePage';

// Layout & Modals
import { MainLayout } from '../components/layout/MainLayout';
import { AddHabitModal } from '../features/habits/components/AddHabitModal';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { useConfirmationDialog } from '../components/ui/useConfirmationDialog';

export function AppRouter() {
    const user = useSelector((state: RootState) => state.auth.user);
    const authStatus = useSelector((state: RootState) => state.auth.status);
    const userProfile = useSelector((state: RootState) => state.user.profile);
    const profileStatus = useSelector((state: RootState) => state.user.status);

    const [modalState, setModalState] = useState<{ isOpen: boolean; habitToEdit: any | null }>({
        isOpen: false,
        habitToEdit: null,
    });

    const { confirm, dialogState, handleConfirm, handleCancel } = useConfirmationDialog();

    if (authStatus === 'loading' || profileStatus === 'loading') {
        return <div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>;
    }

    const destination = (user && (!userProfile || !userProfile.onboardingCompleted)) ? '/onboarding' : '/dashboard';

    const ProtectedRoutes = ({ children, sidebar }: { children: React.ReactNode, sidebar?: React.ReactNode }) => (
        <>
            <MainLayout
                onNewHabitClick={() => setModalState({ isOpen: true, habitToEdit: null })}
                sidebarContent={sidebar}
            >
                {children}
            </MainLayout>
            <AddHabitModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false, habitToEdit: null })}
                habitToEdit={modalState.habitToEdit}
            />
            <ConfirmationDialog
                isOpen={dialogState.isOpen}
                title={dialogState.options?.title || ''}
                message={dialogState.options?.message || ''}
                confirmText={dialogState.options?.confirmText}
                cancelText={dialogState.options?.cancelText}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </>
    );

    return (
        <Router>
            <Routes>
                <Route path="/" element={!user ? <LandingPage /> : <Navigate to={destination} />} />

                {/* Public Routes */}
                <Route path="/share/:userId" element={<SharePage />} />
                <Route path="/onboarding" element={user ? <OnboardingPage /> : <Navigate to="/" />} />

                {/* Protected Routes using the Layout Wrapper */}
                <Route
                    path="/dashboard"
                    element={user ? <ProtectedRoutes sidebar={<DashboardSidebar />}><DashboardPage setModalState={setModalState} confirm={confirm} /></ProtectedRoutes> : <Navigate to="/" />}
                />
                <Route
                    path="/insights"
                    // THIS IS THE CHANGE: Pass the DashboardSidebar to the /insights route
                    element={user ? <ProtectedRoutes sidebar={<DashboardSidebar />}><InsightsPage /></ProtectedRoutes> : <Navigate to="/" />}
                />
                <Route
                    path="/profile"
                    // The profile page has no special sidebar content, which is correct
                    element={user ? <ProtectedRoutes><ProfilePage /></ProtectedRoutes> : <Navigate to="/" />}
                />
            </Routes>
        </Router>
    );
}