import { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiMoreVertical, FiEdit, FiTrash2, FiZap, FiBookOpen, FiCoffee, FiDroplet, FiMoon, FiSun, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import type { RootState, AppDispatch } from '../store/store';
import type { DialogOptions } from '../components/ui/useConfirmationDialog';
import { useCalendar } from '../hooks/useCalendar';
import { getHabits, listenToHabitLogs, deleteHabit, logHabitCompletion } from '../features/habits/services';
import { setHabits, setHabitsStatus } from '../features/habits/habitsSlice';
import { setLogs } from '../features/habits/logsSlice';
import { MotivationalMessage } from '../components/ui/MotivationalMessage';
import { Achievements } from '../components/ui/Achievements';
import { checkAndAwardAchievement } from '../features/user/services';

const iconMap = { FiZap, FiBookOpen, FiCoffee, FiDroplet, FiMoon, FiSun };

interface DashboardPageProps {
    setModalState: (state: { isOpen: boolean; habitToEdit: any | null }) => void;
    confirm: (options: DialogOptions) => Promise<boolean>;
}

// Helper Function: Gets YYYY-MM-DD string based on LOCAL time
const getTodayString = (date: Date = new Date()): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- Main Page Component (Left Column) ---
export function DashboardPage({ setModalState, confirm }: DashboardPageProps) {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.auth.user);
    const habits = useSelector((state: RootState) => state.habits.habits);
    const habitsStatus = useSelector((state: RootState) => state.habits.status);
    const logs = useSelector((state: RootState) => state.logs.logs);

    const today = getTodayString();

    const [updatingHabits, setUpdatingHabits] = useState<Set<string>>(new Set());

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

    const handleToggleCompletion = async (habitId: string) => {
        if (!user || updatingHabits.has(habitId)) return;

        setUpdatingHabits(prev => new Set(prev).add(habitId));

        const todaysLog = logs?.[habitId]?.[today];
        const currentStatus = todaysLog?.completed || false;
        const newStatus = !currentStatus;

        try {
            // Use the correct 'today' variable here
            await logHabitCompletion(user.uid, habitId, today, newStatus);
        } catch (error) {
            console.error("Failed to save habit completion:", error);
        } finally {
            setUpdatingHabits(prev => {
                const next = new Set(prev);
                next.delete(habitId);
                return next;
            });
        }
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
                        const isUpdating = updatingHabits.has(habit.id);
                        return (
                            <HabitItem
                                key={habit.id}
                                habit={habit}
                                isCompleted={isCompletedToday}
                                isUpdating={isUpdating}
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

// --- Sidebar Component (Right Column) ---
export function DashboardSidebar() {
    const user = useSelector((state: RootState) => state.auth.user);
    const habits = useSelector((state: RootState) => state.habits.habits);
    const logs = useSelector((state: RootState) => state.logs.logs);

    const currentStreak = useMemo(() => {
        if (!logs || !habits || habits.length === 0) return 0;
        let streak = 0;
        const today = new Date();
        const todayStr = getTodayString(today);

        // 1. Check if TODAY is fully complete. If not, we count the streak ending YESTERDAY.
        const habitsScheduledToday = habits.filter(h => h.startDate <= todayStr && (!h.endDate || h.endDate >= todayStr));
        const completedToday = habitsScheduledToday.reduce((count, habit) => (logs[habit.id]?.[todayStr]?.completed ? count + 1 : count), 0);

        let isTodayComplete = completedToday === habitsScheduledToday.length;

        // 2. Start checking from today (if complete) or yesterday (if partial/none)
        let startIndex = isTodayComplete ? 0 : 1;

        for (let i = startIndex; i < 365; i++) {
            const dateToCheck = new Date(today);
            dateToCheck.setDate(today.getDate() - i);
            const dateStr = getTodayString(dateToCheck);

            const habitsForDay = habits.filter(h => h.startDate <= dateStr && (!h.endDate || h.endDate >= dateStr));

            if (habitsForDay.length === 0) {
                // If today was skipped, break. If a past day was skipped, break.
                break;
            }

            const completedCount = habitsForDay.reduce((count, habit) => (logs[habit.id]?.[dateStr]?.completed ? count + 1 : count), 0);

            if (completedCount === habitsForDay.length) {
                streak++;
            } else {
                break;
            }
        }

        if (user && streak > 0) {
            checkAndAwardAchievement(user.uid, streak);
        }

        return streak;
    }, [logs, habits, user]);

    return (
        <div className="space-y-6">
            <div className="widget-card">
                <Calendar streak={currentStreak} />
            </div>
            {user && <Achievements userId={user.uid} streak={currentStreak} />}
        </div>
    );
}

// --- Child Components ---
function HabitItem({ habit, isCompleted, isUpdating, onToggleComplete, onEdit, onDelete }: {
    habit: any;
    isCompleted: boolean;
    isUpdating: boolean;
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
        <div className={`habit-item ${isCompleted ? 'habit-item-completed' : ''} ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}>
            <div className={`habit-icon-container color-${habit.color}`}>
                {IconComponent && <IconComponent className="text-white" size={24} />}
            </div>
            <div className="ml-4 flex-grow">
                <p className={`habit-title ${isCompleted ? 'habit-title-completed' : ''}`}>{habit.title}</p>
                <p className="habit-goal">{habit.goal?.target} {habit.goal?.unit}</p>
            </div>
            <div className="relative">
                <button className="options-menu-button" onClick={() => setIsMenuOpen(prev => !prev)} disabled={isUpdating}>
                    <FiMoreVertical size={20} />
                </button>
                {isMenuOpen && (<div className="options-menu fade-in-up"> <button onClick={handleEdit} className="options-menu-item"><FiEdit size={16} className="mr-2" />Edit</button> <button onClick={handleDelete} className="options-menu-item text-red-500"><FiTrash2 size={16} className="mr-2" />Delete</button> </div>)}
            </div>
            <div onClick={onToggleComplete} className={`habit-checkbox ml-4 ${isCompleted ? `color-${habit.color}` : 'border-gray-300'}`}></div>
        </div>
    );
}

function Calendar({ streak }: { streak: number }) {
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

    const dailyStatuses = useMemo(() => {
        const statuses: { [key: number]: 'none' | 'partial' | 'complete' } = {};
        if (!habits) return statuses;

        for (const day of calendarDays) {
            if (!day) continue;

            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            const habitsForDay = habits.filter(h => h.startDate <= dateStr && (!h.endDate || h.endDate >= dateStr));

            if (habitsForDay.length === 0) {
                statuses[day] = 'none';
                continue;
            }

            const completedCount = habitsForDay.reduce((count, habit) => {
                if (logs?.[habit.id] && logs[habit.id][dateStr]?.completed) {
                    return count + 1;
                }
                return count;
            }, 0);

            // --- The Correct Logic Block ---
            if (completedCount === habitsForDay.length) {
                statuses[day] = 'complete';
            } else if (completedCount > 0) {
                statuses[day] = 'partial';
            } else {
                statuses[day] = 'none';
            }
        }
        return statuses;
    }, [habits, logs, calendarDays, currentMonth, currentYear]);

    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const todayObj = new Date();
    const todayDay = todayObj.getDate();
    const todayMonth = todayObj.getMonth();
    const todayYear = todayObj.getFullYear();

    return (
        <div>
            <div className="flex justify-between items-start mb-4">
                <h2 className="widget-title">{`${monthName} ${currentYear}`}</h2>
                <div className="flex items-center gap-4">
                    {streak > 0 && (<div className="streak-counter"><span className="streak-fire-emoji">🔥</span><span>{streak} Day{streak > 1 ? 's' : ''}</span></div>)}
                    <div className="flex items-center">
                        <button onClick={goToPreviousMonth} className="p-1 rounded-full hover:bg-gray-100"><FiChevronLeft size={20} /></button>
                        <button onClick={goToNextMonth} className="p-1 rounded-full hover:bg-gray-100"><FiChevronRight size={20} /></button>
                    </div>
                </div>
            </div>

            <div className="calendar-grid mt-4">
                {daysOfWeek.map((day, index) => <div key={`${day}-${index}`} className="calendar-day-header">{day}</div>)}
                {calendarDays.map((day, index) => {
                    if (!day) return <div key={`empty-${index}`}></div>;

                    const status = dailyStatuses[day] || 'none';
                    const isToday = day === todayDay && currentMonth === todayMonth && currentYear === todayYear;

                    // Apply Blue Outline only if it's today AND the status is 'none' (not yet started)
                    const todayClass = isToday && status === 'none' ? 'is-today' : '';

                    const prevDayStatus = dailyStatuses[day - 1];
                    const nextDayStatus = dailyStatuses[day + 1];

                    // CRITICAL FIX: Only connect if the day is complete AND it's NOT a week boundary
                    const isSunday = index % 7 === 0;
                    const isSaturday = (index + 1) % 7 === 0;

                    // The logic prevents connectors from spanning the weekly gap (Sat->Sun)
                    const connectLeft = status === 'complete' && prevDayStatus === 'complete' && !isSunday;
                    const connectRight = status === 'complete' && nextDayStatus === 'complete' && !isSaturday;

                    let streakClasses = '';
                    if (connectLeft) streakClasses += ' streak-connector-left';
                    if (connectRight) streakClasses += ' streak-connector-right';

                    return (
                        <div key={day} className={`calendar-day-container ${streakClasses}`}>
                            <div className={`calendar-day-circle status-${status} ${todayClass}`}>{day}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}