import { useState, useEffect } from 'react';
import { FiX, FiZap, FiBookOpen, FiCoffee, FiDroplet, FiMoon, FiSun } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import { createHabit, updateHabit } from '../services'; // Import updateHabit and the Habit type
import type { Habit } from '../services'; // Import updateHabit and the Habit type
import styles from './AddHabitModal.module.css';

// 1. DEFINE THE PROPS THE COMPONENT ACCEPTS
interface AddHabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    habitToEdit: (Habit & { id: string }) | null; // <-- THIS IS THE FIX
}

const colorOptions = ['blue', 'green', 'red', 'yellow', 'purple', 'pink', 'teal'];
const iconOptions = { FiZap, FiBookOpen, FiCoffee, FiDroplet, FiMoon, FiSun };

export function AddHabitModal({ isOpen, onClose, habitToEdit }: AddHabitModalProps) { // 2. DESTRUCTURE THE PROP
    const user = useSelector((state: RootState) => state.auth.user);

    const [title, setTitle] = useState('');
    const [titleError, setTitleError] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
    const [selectedIcon, setSelectedIcon] = useState('FiZap');

    const isEditMode = habitToEdit !== null;

    // 3. USEEFFECT TO PRE-FILL THE FORM IN EDIT MODE
    useEffect(() => {
        if (isEditMode && isOpen) {
            setTitle(habitToEdit.title);
            setSelectedColor(habitToEdit.color);
            setSelectedIcon(habitToEdit.icon);
        }
    }, [habitToEdit, isOpen, isEditMode]);

    const handleClose = () => {
        // Reset the form state before closing
        setTitle('');
        setTitleError(null);
        setSelectedColor(colorOptions[0]);
        setSelectedIcon('FiZap');
        onClose();
    };

    const handleSave = async () => {
        if (!title.trim()) {
            setTitleError('Please enter a title for your habit.');
            return;
        }
        setTitleError(null);
        if (!user) return;

        const habitData = {
            title,
            color: selectedColor,
            icon: selectedIcon,
        };

        // 4. USE UPDATE OR CREATE LOGIC
        if (isEditMode) {
            await updateHabit(user.uid, habitToEdit.id, habitData);
        } else {
            await createHabit(user.uid, habitData);
        }

        handleClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalBackdrop}>
            <div className="widget-card w-full max-w-md fade-in-up">
                <div className="flex justify-between items-center">
                    <h2 className="widget-title">{isEditMode ? 'Edit Habit' : 'Create a New Habit'}</h2>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-800">
                        <FiX size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Title Input */}
                    <div>
                        <label className="form-label">Title</label>
                        <input
                            type="text"
                            className="form-input"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                if (titleError) setTitleError(null);
                            }}
                        />
                        {titleError && <p className={styles.formErrorText}>{titleError}</p>}
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className={styles.formSectionTitle}>Color</label>
                        <div className={styles.colorPickerGrid}>
                            {colorOptions.map(color => (
                                <div
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`${styles.colorSwatch} ${selectedColor === color ? styles.colorSwatchSelected : ''}`}
                                >
                                    <div className={`w-full h-full rounded-full color-${color}`}></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Icon Picker */}
                    <div>
                        <label className={styles.formSectionTitle}>Icon</label>
                        <div className={styles.iconPickerGrid}>
                            {Object.keys(iconOptions).map(iconName => {
                                const Icon = iconOptions[iconName as keyof typeof iconOptions];
                                return (
                                    <div
                                        key={iconName}
                                        onClick={() => setSelectedIcon(iconName)}
                                        className={`${styles.iconSwatch} ${selectedIcon === iconName ? styles.iconSwatchSelected : ''}`}
                                    >
                                        <Icon size={22} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button className="btn-primary" onClick={handleSave}>Save Habit</button>
                    </div>
                </div>
            </div>
        </div>
    );
}