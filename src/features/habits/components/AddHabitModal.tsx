import { useState, useEffect } from 'react';
import { FiX, FiZap, FiBookOpen, FiCoffee, FiDroplet, FiMoon, FiSun, FiTrash2, FiPlusCircle } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import { createHabit, updateHabit } from '../services';
import type { Habit } from '../services';
import styles from './AddHabitModal.module.css';

interface AddHabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    habitToEdit: (Habit & { id: string }) | null;
}

const colorOptions = ['blue', 'green', 'red', 'yellow', 'purple', 'pink', 'teal'];
const iconOptions = { FiZap, FiBookOpen, FiCoffee, FiDroplet, FiMoon, FiSun };

export function AddHabitModal({ isOpen, onClose, habitToEdit }: AddHabitModalProps) {
    const user = useSelector((state: RootState) => state.auth.user);

    const getTodayString = () => new Date().toISOString().split('T')[0];

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [titleError, setTitleError] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
    const [selectedIcon, setSelectedIcon] = useState('FiZap');
    const [goalType, setGoalType] = useState<'reps' | 'duration' | 'steps'>('reps');
    const [goalTarget, setGoalTarget] = useState<number>(1);
    const [goalUnit, setGoalUnit] = useState('times');
    const [repeatFrequency, setRepeatFrequency] = useState<'daily' | 'weekly'>('daily');
    const [subtasks, setSubtasks] = useState<{ [id: string]: { text: string; completed: boolean } }>({});
    const [newSubtaskText, setNewSubtaskText] = useState('');
    const [startDate, setStartDate] = useState(getTodayString());
    const [endDate, setEndDate] = useState('');
    const [reminderTime, setReminderTime] = useState('');

    const isEditMode = habitToEdit !== null;

    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setTitle(habitToEdit.title);
                setCategory(habitToEdit.category || '');
                setSelectedColor(habitToEdit.color);
                setSelectedIcon(habitToEdit.icon);
                setGoalType(habitToEdit.goal?.type as any || 'reps');
                setGoalTarget(habitToEdit.goal?.target || 1);
                setGoalUnit(habitToEdit.goal?.unit || 'times');
                setRepeatFrequency(habitToEdit.repeat?.frequency || 'daily');
                setSubtasks(habitToEdit.subtasks || {});
                setStartDate(habitToEdit.startDate || getTodayString());
                setEndDate(habitToEdit.endDate || '');
                setReminderTime(habitToEdit.reminderTime || '');
            }
        }
    }, [habitToEdit, isOpen, isEditMode]);

    const handleAddSubtask = () => {
        if (!newSubtaskText.trim()) return;
        const newId = `subtask_${Date.now()}`;
        setSubtasks(prev => ({ ...prev, [newId]: { text: newSubtaskText, completed: false } }));
        setNewSubtaskText('');
    };

    const handleRemoveSubtask = (id: string) => {
        setSubtasks(prev => {
            const newSubtasks = { ...prev };
            delete newSubtasks[id];
            return newSubtasks;
        });
    };

    const handleClose = () => {
        setTitle('');
        setCategory('');
        setTitleError(null);
        setSelectedColor(colorOptions[0]);
        setSelectedIcon('FiZap');
        setGoalType('reps');
        setGoalTarget(1);
        setGoalUnit('times');
        setRepeatFrequency('daily');
        setSubtasks({});
        setNewSubtaskText('');
        setStartDate(getTodayString());
        setEndDate('');
        setReminderTime('');
        onClose();
    };

    const handleSave = async () => {
        if (!title.trim()) {
            setTitleError('Please enter a title for your habit.');
            return;
        }
        setTitleError(null);
        if (!user) return;

        const habitData: Partial<Habit> = {
            title,
            icon: selectedIcon,
            color: selectedColor,
            category: category.trim() || 'General',
            goal: { type: goalType, target: goalTarget, unit: goalUnit },
            repeat: { frequency: repeatFrequency },
            subtasks,
            startDate,
        };

        if (endDate) habitData.endDate = endDate;
        if (reminderTime) habitData.reminderTime = reminderTime;

        if (isEditMode) {
            await updateHabit(user.uid, habitToEdit.id, habitData);
        } else {
            await createHabit(user.uid, habitData as Habit);
        }
        handleClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalBackdrop}>
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] fade-in-up">
                <div className="flex-shrink-0 px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">{isEditMode ? 'Edit Habit' : 'Create a New Habit'}</h2>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-800"><FiX size={24} /></button>
                </div>
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">Title</label>
                            <input type="text" className="form-input" value={title} onChange={(e) => { setTitle(e.target.value); if (titleError) setTitleError(null); }} />
                            {titleError && <p className={styles.formErrorText}>{titleError}</p>}
                        </div>
                        <div>
                            <label className="form-label">Category</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g., Health, Work, Fitness..."
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className={styles.formSectionTitle}>Color</label>
                            <div className={styles.colorPickerGrid}>
                                {colorOptions.map(color => (<div key={color} onClick={() => setSelectedColor(color)} className={`${styles.colorSwatch} ${selectedColor === color ? styles.colorSwatchSelected : ''}`}> <div className={`w-full h-full rounded-full color-${color}`}></div> </div>))}
                            </div>
                        </div>
                        <div>
                            <label className={styles.formSectionTitle}>Icon</label>
                            <div className={styles.iconPickerGrid}>
                                {Object.keys(iconOptions).map(iconName => { const Icon = iconOptions[iconName as keyof typeof iconOptions]; return (<div key={iconName} onClick={() => setSelectedIcon(iconName)} className={`${styles.iconSwatch} ${selectedIcon === iconName ? styles.iconSwatchSelected : ''}`}> <Icon size={22} /> </div>); })}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className={styles.formSectionTitle}>Goal</label>
                        <div className={styles.segmentedControl}>
                            <button onClick={() => { setGoalType('reps'); setGoalUnit('times'); }} className={`${styles.segmentedControlButton} ${goalType === 'reps' ? styles.segmentedControlButtonSelected : ''}`}>Reps</button>
                            <button onClick={() => { setGoalType('duration'); setGoalUnit('minutes'); }} className={`${styles.segmentedControlButton} ${goalType === 'duration' ? styles.segmentedControlButtonSelected : ''}`}>Duration</button>
                            <button onClick={() => { setGoalType('steps'); setGoalUnit('steps'); }} className={`${styles.segmentedControlButton} ${goalType === 'steps' ? styles.segmentedControlButtonSelected : ''}`}>Steps</button>
                        </div>
                        <div className="flex mt-3">
                            <input type="number" min="1" className="form-input rounded-r-none border-r-0 focus:z-10 relative" value={goalTarget} onChange={(e) => setGoalTarget(Number(e.target.value))} />
                            <span className="inline-flex items-center px-4 text-gray-600 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg">{goalUnit}</span>
                        </div>
                    </div>
                    <div>
                        <label className={styles.formSectionTitle}>Repeat</label>
                        <div className={styles.segmentedControl}>
                            <button onClick={() => setRepeatFrequency('daily')} className={`${styles.segmentedControlButton} ${repeatFrequency === 'daily' ? styles.segmentedControlButtonSelected : ''}`}>Daily</button>
                            <button onClick={() => setRepeatFrequency('weekly')} className={`${styles.segmentedControlButton} ${repeatFrequency === 'weekly' ? styles.segmentedControlButtonSelected : ''}`}>Weekly</button>
                        </div>
                    </div>
                    <div>
                        <label className={styles.formSectionTitle}>Schedule</label>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="form-label">Start Date</label>
                                <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            </div>
                            <div className="flex-1">
                                <label className="form-label">End Date (Optional)</label>
                                <input type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className={styles.formSectionTitle}>Reminder (Optional)</label>
                        <div>
                            <label className="form-label">Reminder Time</label>
                            <input type="time" className="form-input" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className={styles.formSectionTitle}>Subtasks (Optional)</label>
                        <div className={styles.subtaskList}>
                            {Object.entries(subtasks).map(([id, subtask]) => (<div key={id} className={styles.subtaskItem}><p className="form-input bg-transparent border-none p-0 flex-grow">{subtask.text}</p><button onClick={() => handleRemoveSubtask(id)} className={styles.subtaskDeleteButton}><FiTrash2 size={16} /></button></div>))}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <button type="button" onClick={handleAddSubtask} className="text-gray-400 hover:text-indigo-600 transition-colors" title="Add Subtask"><FiPlusCircle size={20} /></button>
                            <input type="text" className="form-input flex-grow bg-transparent border-none p-0 focus:ring-0" placeholder="Add a new subtask..." value={newSubtaskText} onChange={(e) => setNewSubtaskText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }} />
                        </div>
                    </div>
                </div>
                <div className="flex-shrink-0 px-6 py-4 border-t bg-gray-50 flex justify-end">
                    <button className="btn-primary" onClick={handleSave}>Save Habit</button>
                </div>
            </div>
        </div>
    );
}