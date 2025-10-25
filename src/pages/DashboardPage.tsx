// No changes needed here, but this is the complete file for reference.
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiPlus, FiMoreVertical, FiEdit, FiTrash2, FiZap, FiBookOpen, FiCoffee, FiDroplet, FiMoon, FiSun, FiLogOut } from 'react-icons/fi';
import type { RootState, AppDispatch } from '../store/store';
import { useConfirmationDialog } from '../components/ui/useConfirmationDialog';
import type { DialogOptions } from '../components/ui/useConfirmationDialog';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { AddHabitModal } from '../features/habits/components/AddHabitModal';
import { getHabits, deleteHabit } from '../features/habits/services';
import { setHabits, setHabitsStatus } from '../features/habits/habitsSlice';
import { signOutUser } from '../features/auth/services';
import { clearUser } from '../features/auth/authSlice';

const iconMap = { FiZap, FiBookOpen, FiCoffee, FiDroplet, FiMoon, FiSun };

export function DashboardPage() {
    const user = useSelector((state: RootState) => state.auth.user);
    const habits = useSelector((state: RootState) => state.habits.habits);
    const habitsStatus = useSelector((state: RootState) => state.habits.status);

    const dispatch = useDispatch<AppDispatch>();

    const [modalState, setModalState] = useState<{ isOpen: boolean; habitToEdit: any | null }>({
        isOpen: false,
        habitToEdit: null,
    });

    const [completions, setCompletions] = useState<{ [key: string]: boolean }>({});

    const { confirm, dialogState, handleConfirm, handleCancel } = useConfirmationDialog();

    useEffect(() => {
        if (user) {
            dispatch(setHabitsStatus('loading'));
            const unsubscribe = getHabits(user.uid, (habits) => {
                dispatch(setHabits(habits));
            });
            return () => unsubscribe();
        }
    }, [user, dispatch]);

    const handleSignOut = async () => {
        await signOutUser();
        dispatch(clearUser());
    };

    const handleToggleCompletion = (habitId: string) => {
        setCompletions(prev => ({ ...prev, [habitId]: !prev[habitId] }));
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
                            {habitsStatus === 'succeeded' && habits.map(habit => (
                                <HabitItem
                                    key={habit.id}
                                    habit={habit}
                                    isCompleted={completions[habit.id] || false}
                                    onToggleComplete={() => handleToggleCompletion(habit.id)}
                                    onEdit={() => setModalState({ isOpen: true, habitToEdit: habit })}
                                    onDelete={confirm}
                                />
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

    return (
        <div className={`habit-item ${isCompleted ? 'habit-item-completed' : ''}`}>
            <div className={`habit-icon-container color-${habit.color}`}>
                {IconComponent && <IconComponent className="text-white" size={24} />}
            </div>
            <div className="ml-4 flex-grow">
                <p className={`habit-title ${isCompleted ? 'habit-title-completed' : ''}`}>{habit.title}</p>
                <p className="habit-goal">Goal placeholder</p>
            </div>
            <div className="relative">
                <button className="options-menu-button" onClick={() => setIsMenuOpen(prev => !prev)}>
                    <FiMoreVertical size={20} />
                </button>
                {isMenuOpen && (
                    <div className="options-menu fade-in-up">
                        <button
                            onClick={() => {
                                onEdit(); // Call the function passed from the parent
                                setIsMenuOpen(false); // Also close the menu
                            }}
                            className="options-menu-item"
                        >
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
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const dates = Array.from({ length: 35 }, (_, i) => i - 2);
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