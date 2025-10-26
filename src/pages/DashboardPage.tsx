import { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiChevronRight, FiChevronLeft, FiMoreVertical, FiEdit, FiTrash2, FiZap, FiBookOpen, FiCoffee, FiDroplet, FiMoon, FiSun } from 'react-icons/fi';
import type { RootState, AppDispatch } from '../store/store';
import type { DialogOptions } from '../components/ui/useConfirmationDialog';
import { getHabits, listenToHabitLogs, deleteHabit, logHabitCompletion } from '../features/habits/services';
import { setHabits, setHabitsStatus } from '../features/habits/habitsSlice';
import { setLogs } from '../features/habits/logsSlice';
import { MotivationalMessage } from '../components/ui/MotivationalMessage';
import { useCalendar } from '../hooks/useCalendar';

const iconMap = { FiZap, FiBookOpen, FiCoffee, FiDroplet, FiMoon, FiSun };

interface DashboardPageProps {
    setModalState: (state: { isOpen: boolean; habitToEdit: any | null }) => void;
    confirm: (options: DialogOptions) => Promise<boolean>;
}

export function DashboardPage({ setModalState, confirm }: DashboardPageProps) {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.auth.user);
    const habits = useSelector((state: RootState) => state.habits.habits);
    const habitsStatus = useSelector((state: RootState) => state.habits.status);
    const logs = useSelector((state: RootState) => state.logs.logs);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        if (user) {
            dispatch(setHabitsStatus('loading'));
            const habitsUnsubscribe = getHabits(user.uid, (habits) => { dispatch(setHabits(habits)); });
            const logsUnsubscribe = listenToHabitLogs(user.uid, (logs) => { dispatch(setLogs(logs)); });
            return () => {
                habitsUnsubscribe();
                logsUnsubscribe();
            };
        }
    }, [user, dispatch]);

    const handleToggleCompletion = (habitId: string) => {
        if (!user) return;
        const todaysLog = logs?.[habitId]?.[today];
        const currentStatus = todaysLog?.completed || false;
        logHabitCompletion(user.uid, habitId, today, !currentStatus);
    };

    return (
        <div className="space-y-6">
            <div className="widget-card">
                <h2 className="widget-title">Today's Habits</h2>
                <div className="space-y-4">
                    {habitsStatus === 'loading' && <p>Loading habits...</p>}
                    {habitsStatus === 'succeeded' && habits.length === 0 && (
                        <p className="text-gray-500">You haven't created any habits yet. Click "New Habit" to get started!</p>
                    )}
                    {habitsStatus === 'succeeded' && habits.map(habit => {
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
            <MotivationalMessage />
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
                        <button onClick={handleEdit} className="options-menu-item"><FiEdit size={16} className="mr-2" />Edit</button>
                        <button onClick={handleDelete} className="options-menu-item text-red-500"><FiTrash2 size={16} className="mr-2" />Delete</button>
                    </div>
                )}
            </div>
            <div onClick={onToggleComplete} className={`habit-checkbox ml-4 ${isCompleted ? `color-${habit.color}` : 'border-gray-300'}`}></div>
        </div>
    );
}

export function Calendar() {
    const habits = useSelector((state: RootState) => state.habits.habits);
    const logs = useSelector((state: RootState) => state.logs.logs);

    const {
        currentMonth,
        currentYear,
        calendarDays,
        monthName,
        goToNextMonth,
        goToPreviousMonth
    } = useCalendar();

    const calculateCurrentStreak = () => {
        if (!logs || habits.length === 0) return 0;
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
            const dateToCheck = new Date(today);
            dateToCheck.setDate(today.getDate() - i);
            const dateStr = dateToCheck.toISOString().split('T')[0];

            const allHabitsForDay = habits.filter(h => new Date(h.startDate) <= dateToCheck && (!h.endDate || new Date(h.endDate) >= dateToCheck));

            if (allHabitsForDay.length === 0) {
                if (i === 0) return 0; // No habits scheduled for today
                break; // Streak ends if there were no habits scheduled for a past day
            }

            const completedCount = allHabitsForDay.reduce((count, habit) => {
                if (logs[habit.id]?.[dateStr]?.completed) {
                    return count + 1;
                }
                return count; // <-- THIS RETURN WAS MISSING
            }, 0);

            if (completedCount === allHabitsForDay.length) {
                streak++;
            } else {
                if (i === 0) return 0; // Today is not fully complete
                break; // Streak is broken
            }
        }
        return streak;
    };

    const currentStreak = calculateCurrentStreak();

    const dailyStatuses = useMemo(() => {
        const statuses: { [key: number]: 'none' | 'partial' | 'complete' } = {};
        if (!habits || habits.length === 0) return statuses;

        for (const day of calendarDays) {
            if (!day) continue;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            const habitsForDay = habits.filter(h => new Date(h.startDate) <= new Date(dateStr) && (!h.endDate || new Date(h.endDate) >= new Date(dateStr)));
            if (habitsForDay.length === 0) {
                statuses[day] = 'none';
                continue;
            }

            const completedCount = habitsForDay.reduce((count, habit) => (logs?.[habit.id]?.[dateStr]?.completed ? count + 1 : count), 0);

            if (completedCount === 0) statuses[day] = 'none';
            else if (completedCount < habitsForDay.length) statuses[day] = 'partial';
            else statuses[day] = 'complete';
        }
        return statuses;
    }, [habits, logs, calendarDays, currentMonth, currentYear]);

    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <div>
            <div className="calendar-header">
                <h2 className="widget-title">{`${monthName} ${currentYear}`}</h2>
                <div className="flex items-center gap-4">
                    {currentStreak > 0 && (
                        <div className="streak-counter">
                            <span className="streak-fire-emoji">🔥</span>
                            <span>{currentStreak} Day{currentStreak > 1 ? 's' : ''}</span>
                        </div>
                    )}
                    <div className="flex items-center">
                        <button onClick={goToPreviousMonth} className="p-1 rounded-full hover:bg-gray-100">
                            <FiChevronLeft size={20} />
                        </button>
                        <button onClick={goToNextMonth} className="p-1 rounded-full hover:bg-gray-100">
                            <FiChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
            <div className="calendar-grid mt-4">
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
                            <div className={`calendar-day-circle status-${status}`}>{day}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}