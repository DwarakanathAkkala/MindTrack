import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiPlus, FiMoreVertical, FiEdit, FiTrash2, FiZap, FiBookOpen, FiCoffee, FiDroplet, FiMoon, FiSun, FiLogOut } from 'react-icons/fi';
import type { RootState, AppDispatch } from '../store/store';
import { useConfirmationDialog } from '../components/ui/useConfirmationDialog';
import type { DialogOptions } from '../components/ui/useConfirmationDialog';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { AddHabitModal } from '../features/habits/components/AddHabitModal';
import { getHabits, listenToHabitLogs, deleteHabit, updateHabit, logHabitCompletion } from '../features/habits/services';
import { setHabits, setHabitsStatus } from '../features/habits/habitsSlice';
import { setLogs } from '../features/habits/logsSlice';
import { signOutUser } from '../features/auth/services';
import { clearUser } from '../features/auth/authSlice';

const iconMap = { FiZap, FiBookOpen, FiCoffee, FiDroplet, FiMoon, FiSun };

export function DashboardPage() {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.auth.user);
    const habits = useSelector((state: RootState) => state.habits.habits);
    const habitsStatus = useSelector((state: RootState) => state.habits.status);
    const logs = useSelector((state: RootState) => state.logs.logs); // Get logs from Redux

    const [modalState, setModalState] = useState<{ isOpen: boolean; habitToEdit: any | null }>({
        isOpen: false,
        habitToEdit: null,
    });

    const { confirm, dialogState, handleConfirm, handleCancel } = useConfirmationDialog();
    const today = new Date().toISOString().split('T')[0];

    // CORRECTED useEffect: This uses the real-time listeners
    useEffect(() => {
        if (user) {
            dispatch(setHabitsStatus('loading'));

            const habitsUnsubscribe = getHabits(user.uid, (habits) => {
                dispatch(setHabits(habits));
            });

            const logsUnsubscribe = listenToHabitLogs(user.uid, (logs) => {
                dispatch(setLogs(logs));
            });

            return () => {
                habitsUnsubscribe();
                logsUnsubscribe();
            };
        }
    }, [user, dispatch]);

    const handleSignOut = async () => {
        await signOutUser();
        dispatch(clearUser());
    };

    // CORRECTED handleToggleCompletion: Reads from 'logs' state
    const handleToggleCompletion = (habitId: string) => {
        if (!user) return;
        const todaysLog = logs?.[habitId]?.[today];
        const currentStatus = todaysLog?.completed || false;
        const newStatus = !currentStatus;
        logHabitCompletion(user.uid, habitId, today, newStatus);
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <header className="bg-white shadow-sm p-4 flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                    Welcome, {user?.displayName || 'User'}!
                </h1>
                <div className="flex items-center space-x-2">
                    <button className="btn-primary-header" onClick={() => setModalState({ isOpen: true, habitToEdit: null })}>
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
                    <div className="widget-card">
                        <h2 className="widget-title">Today's Habits</h2>
                        <div className="space-y-4">
                            {habitsStatus === 'loading' && <p>Loading habits...</p>}
                            {habitsStatus === 'succeeded' && habits.length === 0 && (
                                <p className="text-gray-500">You haven't created any habits yet. Click "New Habit" to get started!</p>
                            )}
                            {habitsStatus === 'succeeded' && habits.map(habit => {
                                // CORRECTED LOGIC: Reads completion status from Redux 'logs' state
                                const isCompletedToday = logs?.[habit.id]?.[today]?.completed || false;
                                return (
                                    <HabitItem
                                        key={habit.id}
                                        habit={habit}
                                        isCompleted={isCompletedToday}
                                        onToggleComplete={() => handleToggleCompletion(habit.id)}
                                        onEdit={() => setModalState({ isOpen: true, habitToEdit: habit })}
                                        onDelete={confirm}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="dashboard-sidebar">
                    <div className="widget-card">
                        <Calendar />
                    </div>
                </div>
            </main>

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
        </div>
    );
}

// --- Child Components ---

function HabitItem({ habit, isCompleted, onToggleComplete, onEdit, onDelete }: {
    habit: any;
    isCompleted: boolean;
    onToggleComplete: () => void;
    onEdit: () => void;
    onDelete: (options: DialogOptions) => Promise<boolean>;
}) {
    const user = useSelector((state: RootState) => state.auth.user);
    const IconComponent = iconMap[habit.icon as keyof typeof iconMap];
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleDelete = async () => {
        if (!user) return;
        setIsMenuOpen(false);
        const wasConfirmed = await onDelete({
            title: "Delete Habit",
            message: `Are you sure you want to permanently delete "${habit.title}"? This action cannot be undone.`,
            confirmText: "Yes, Delete",
            cancelText: "No, Keep it",
        });
        if (wasConfirmed) {
            deleteHabit(user.uid, habit.id);
        }
    };

    const handleEdit = () => {
        onEdit();
        setIsMenuOpen(false);
    };

    return (
        <div className={`habit-item ${isCompleted ? 'habit-item-completed' : ''}`}>
            <div className={`habit-icon-container color-${habit.color}`}>
                {IconComponent && <IconComponent className="text-white" size={24} />}
            </div>
            <div className="ml-4 flex-grow">
                <p className={`habit-title ${isCompleted ? 'habit-title-completed' : ''}`}>{habit.title}</p>
                <p className="habit-goal">{habit.goal?.target} {habit.goal?.unit}</p>
            </div>
            <div className="relative">
                <button className="options-menu-button" onClick={() => setIsMenuOpen(prev => !prev)}>
                    <FiMoreVertical size={20} />
                </button>
                {isMenuOpen && (
                    <div className="options-menu fade-in-up">
                        <button onClick={handleEdit} className="options-menu-item">
                            <FiEdit size={16} className="mr-2" />
                            Edit
                        </button>
                        <button onClick={handleDelete} className="options-menu-item text-red-500">
                            <FiTrash2 size={16} className="mr-2" />
                            Delete
                        </button>
                    </div>
                )}
            </div>
            <div
                onClick={onToggleComplete}
                className={`habit-checkbox ml-4 ${isCompleted ? `color-${habit.color}` : 'border-gray-300'}`}
            ></div>
        </div>
    );
}

function Calendar() {
    const habits = useSelector((state: RootState) => state.habits.habits);
    const logs = useSelector((state: RootState) => state.logs.logs);

    // --- Streak Calculation Logic ---
    const calculateCurrentStreak = () => {
        if (!logs || habits.length === 0) {
            return 0;
        }

        let streak = 0;
        const today = new Date();

        for (let i = 0; i < 365; i++) { // Check up to a year back
            const dateToCheck = new Date(today);
            dateToCheck.setDate(today.getDate() - i);

            const year = dateToCheck.getFullYear();
            const month = String(dateToCheck.getMonth() + 1).padStart(2, '0');
            const day = String(dateToCheck.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            const completedCount = habits.reduce((count, habit) => {
                if (logs[habit.id]?.[dateStr]?.completed) {
                    return count + 1;
                }
                return count;
            }, 0);

            if (completedCount === habits.length) {
                streak++; // This day is a full completion, increment streak
            } else {
                // As soon as we find a day that is not a full completion, the streak is broken
                // But we need to check if today itself is not a full completion day
                if (i === 0) {
                    // If today isn't a full completion, streak is 0
                    return 0;
                } else {
                    // The streak ended yesterday.
                    break;
                }
            }
        }
        return streak;
    };

    const currentStreak = calculateCurrentStreak();

    // --- Date and Calendar Day Calculation Logic (no changes here) ---
    const todayDate = new Date();
    const currentMonth = todayDate.getMonth();
    const currentYear = todayDate.getFullYear();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const calendarDays = Array.from({ length: firstDayOfMonth + daysInMonth }, (_, i) => {
        if (i < firstDayOfMonth) return null;
        return i - firstDayOfMonth + 1;
    });

    const dailyStatuses: { [key: number]: 'none' | 'partial' | 'complete' } = {};
    if (habits.length > 0) {
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const completedCount = habits.reduce((count, habit) => (logs?.[habit.id]?.[dateStr]?.completed ? count + 1 : count), 0);
            if (completedCount === 0) dailyStatuses[day] = 'none';
            else if (completedCount < habits.length) dailyStatuses[day] = 'partial';
            else dailyStatuses[day] = 'complete';
        }
    }

    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <div>
            {/* --- NEW HEADER SECTION --- */}
            <div className="calendar-header">
                <h2 className="widget-title">Streak Calendar</h2>
                {currentStreak > 0 && (
                    <div className="streak-counter">
                        <span className="streak-fire-emoji">🔥</span>
                        <span>{currentStreak} Day{currentStreak > 1 ? 's' : ''}</span>
                    </div>
                )}
            </div>

            {/* --- CALENDAR GRID (no changes here) --- */}
            <div className="calendar-grid">
                {daysOfWeek.map((day, index) => <div key={`${day}-${index}`} className="calendar-day-header">{day}</div>)}
                {calendarDays.map((day, index) => {
                    if (!day) return <div key={`empty-${index}`}></div>;
                    const status = dailyStatuses[day] || 'none';
                    const prevDayStatus = dailyStatuses[day - 1];
                    const nextDayStatus = dailyStatuses[day + 1];
                    const connectLeft = status === 'complete' && prevDayStatus === 'complete';
                    const connectRight = status === 'complete' && nextDayStatus === 'complete';
                    let streakClasses = '';
                    if (connectLeft) streakClasses += ' streak-connect-left';
                    if (connectRight) streakClasses += ' streak-connect-right';
                    return (
                        <div key={day} className={`calendar-day-container ${streakClasses}`}>
                            <div className={`calendar-day-circle status-${status}`}>
                                {day}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}