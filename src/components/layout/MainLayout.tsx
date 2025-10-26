import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, Link } from 'react-router-dom';
import { FiPlus, FiLogOut, FiHome, FiBarChart2, FiUser } from 'react-icons/fi';
import type { RootState, AppDispatch } from '../../store/store';
import { signOutUser } from '../../features/auth/services';
import { clearUser } from '../../features/auth/authSlice';
import { Calendar } from '../../pages/DashboardPage';
import { useReminder } from '../../hooks/useReminder';
import { ReminderManager } from '../ui/ReminderManager';
import logoSrc from '../../assets/logoIcon.webp';

interface MainLayoutProps {
    children: ReactNode;
    onNewHabitClick: () => void;
}

export function MainLayout({ children, onNewHabitClick }: MainLayoutProps) {
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch<AppDispatch>();

    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useReminder();

    // This effect handles closing the menu when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuRef]);

    const handleSignOut = async () => {
        setIsProfileMenuOpen(false);
        await signOutUser();
        dispatch(clearUser());
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <header className="bg-white shadow-sm p-4 flex justify-between items-center">
                {/* Left Side: Logo */}
                <Link to="/dashboard" className="flex items-center gap-3">
                    <img src={logoSrc} alt="MindTrack Logo" className="h-10 w-10" />
                    <span className="text-xl font-bold text-gray-800 hidden sm:block">MindTrack</span>
                </Link>

                {/* Right Side: Actions & Profile Menu */}
                <div className="flex items-center space-x-4">
                    <button className="btn-primary-header" onClick={onNewHabitClick}>
                        <FiPlus className="mr-2 hidden sm:block" />
                        New Habit
                    </button>

                    {/* Profile Button and Dropdown */}
                    <div className="relative" ref={menuRef}>
                        <button
                            className="profile-button"
                            onClick={() => setIsProfileMenuOpen(prev => !prev)}
                        >
                            <img
                                src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}&background=random`}
                                alt="User Profile"
                                className="profile-avatar"
                            />
                        </button>

                        {isProfileMenuOpen && (
                            <div className="options-menu fade-in-up w-48">
                                <div className="px-4 py-2 border-b">
                                    <p className="font-semibold text-sm truncate">{user?.displayName}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                </div>
                                <NavLink to="/profile" className="options-menu-item" onClick={() => setIsProfileMenuOpen(false)}>
                                    <FiUser size={16} className="mr-2" />
                                    Profile
                                </NavLink>
                                <button onClick={handleSignOut} className="options-menu-item text-red-500">
                                    <FiLogOut size={16} className="mr-2" />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
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
                    <ReminderManager />
                    <div className="widget-card">
                        <Calendar />
                    </div>
                </aside>
            </main>
        </div>
    );
}