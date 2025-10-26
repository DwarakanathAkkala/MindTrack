import type { ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { FiPlus, FiLogOut, FiHome, FiBarChart2 } from 'react-icons/fi';
import type { RootState, AppDispatch } from '../../store/store';
import { signOutUser } from '../../features/auth/services';
import { clearUser } from '../../features/auth/authSlice';
import { Calendar } from '../../pages/DashboardPage';
import { useReminder } from '../../hooks/useReminder'; // Import the hook
import { ReminderManager } from '../ui/ReminderManager'; // Import the new component

interface MainLayoutProps {
    children: ReactNode;
    onNewHabitClick: () => void;
}

export function MainLayout({ children, onNewHabitClick }: MainLayoutProps) {
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch<AppDispatch>();

    // Activate the reminder hook so it runs in the background
    useReminder();

    const handleSignOut = async () => {
        await signOutUser();
        dispatch(clearUser());
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <header className="bg-white shadow-sm p-4 flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                    Welcome, {user?.displayName || 'User'}!
                </h1>
                <div className="flex items-center space-x-2">
                    <button className="btn-primary-header" onClick={onNewHabitClick}>
                        <FiPlus className="mr-2" />
                        New Habit
                    </button>
                    <button
                        className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
                        onClick={handleSignOut}
                        title="Sign Out"
                    >
                        <FiLogOut size={22} />
                    </button>
                </div>
            </header>

            <main className="dashboard-grid">
                <div className="dashboard-main-content">
                    {children}
                </div>

                <aside className="dashboard-sidebar lg:col-span-1">
                    <div className="widget-card">
                        <h2 className="widget-title">Navigation</h2>
                        <nav className="space-y-2">
                            <NavLink to="/dashboard" className={({ isActive }) => isActive ? "main-nav-link main-nav-link-active" : "main-nav-link"}>
                                <FiHome /> <span>Dashboard</span>
                            </NavLink>
                            <NavLink to="/insights" className={({ isActive }) => isActive ? "main-nav-link main-nav-link-active" : "main-nav-link"}>
                                <FiBarChart2 /> <span>Insights</span>
                            </NavLink>
                        </nav>
                    </div>

                    {/* Add the Reminder Manager to the sidebar */}
                    <ReminderManager />

                    <div className="widget-card">
                        <Calendar />
                    </div>
                </aside>
            </main>
        </div>
    );
}