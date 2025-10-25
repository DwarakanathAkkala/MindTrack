import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FiZap, FiBookOpen, FiCoffee, FiDroplet, FiMoon, FiSun } from 'react-icons/fi';
import { FiPlus, FiCheck, FiLogOut } from 'react-icons/fi';
import type { RootState } from '../store/store';
import { AddHabitModal } from '../features/habits/components/AddHabitModal';
import { useDispatch } from 'react-redux';
import { signOutUser } from '../features/auth/services';
import { clearUser } from '../features/auth/authSlice';
import type { AppDispatch } from '../store/store';
import { getHabits } from '../features/habits/services';
import { setHabits, setHabitsStatus } from '../features/habits/habitsSlice';

// Placeholder data for today's habits
const mockHabits = [
    { id: '1', title: 'Morning Workout', icon: 'FiZap', color: 'blue', goal: '30 minutes', completed: false },
    { id: '2', title: 'Drink Water', icon: 'FiDroplet', color: 'teal', goal: '8 glasses', completed: true },
    { id: '3', title: 'Read a Book', icon: 'FiBookOpen', color: 'purple', goal: '1 chapter', completed: false },
];

export function DashboardPage() {
    const user = useSelector((state: RootState) => state.auth.user);
    const habits = useSelector((state: RootState) => state.habits.habits);
    const habitsStatus = useSelector((state: RootState) => state.habits.status);


    const [isModalOpen, setIsModalOpen] = useState(false);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        if (user) {
            dispatch(setHabitsStatus('loading'));
            const unsubscribe = getHabits(user.uid, (habits) => {
                dispatch(setHabits(habits));
            });

            // Return a cleanup function to unsubscribe when the component unmounts
            return () => unsubscribe();
        }
    }, [user, dispatch]);

    const handleSignOut = async () => {
        await signOutUser();
        dispatch(clearUser());
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Header */}
            <header className="bg-white shadow-sm p-4 flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                    Welcome, {user?.displayName || 'User'}!
                </h1>
                <div className="flex items-center space-x-2">
                    <button className="btn-primary-header" onClick={() => setIsModalOpen(true)}>
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

            {/* Main Content Grid */}
            <main className="dashboard-grid">
                <div className="dashboard-main-content">
                    <div className="widget-card">
                        <h2 className="widget-title">Today's Habits</h2>
                        <div className="space-y-4">
                            {habitsStatus === 'loading' && <p>Loading habits...</p>}
                            {habitsStatus === 'succeeded' && habits.length === 0 && (
                                <p className="text-gray-500">You haven't created any habits yet. Click "New Habit" to get started!</p>
                            )}
                            {habitsStatus === 'succeeded' && habits.map(habit => (
                                <HabitItem key={habit.id} habit={habit} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="dashboard-sidebar">
                    <div className="widget-card">
                        <h2 className="widget-title">Streak Calendar</h2>
                        <Calendar />
                    </div>
                </div>
            </main>

            <AddHabitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}

const iconMap = { FiZap, FiBookOpen, FiCoffee, FiDroplet, FiMoon, FiSun };

// A new component for displaying a single habit
function HabitItem({ habit }: { habit: any }) {
    const IconComponent = iconMap[habit.icon as keyof typeof iconMap];

    return (
        <div className="habit-item">
            <div className={`habit-icon-container color-${habit.color}`}>
                {IconComponent && <IconComponent className="text-white" size={24} />}
            </div>
            <div className="ml-4 flex-grow">
                <p className="habit-title">{habit.title}</p>
                <p className="habit-goal">{habit.goal}</p>
            </div>
            <div className={`habit-checkbox ${habit.completed ? `color-${habit.color}` : 'border-gray-300'}`}>
                {habit.completed && <FiCheck className="text-white mx-auto my-auto" />}
            </div>
        </div>
    );
}

// A new component for the calendar
function Calendar() {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const dates = Array.from({ length: 35 }, (_, i) => i - 2); // Dummy dates
    return (
        <div>
            <div className="calendar-grid">
                {days.map((day, index) => <div key={`${day}-${index}`} className="calendar-day-header">{day}</div>)}
                {dates.map(date => (
                    <div key={date} className="calendar-day">
                        <p className={date > 0 ? 'text-gray-700' : 'text-gray-300'}>{date > 0 ? date : ''}</p>
                    </div>
                ))}
            </div>
            <div className="text-center mt-2">
                <div className="calendar-streak-bar"></div>
            </div>
        </div>
    )
}