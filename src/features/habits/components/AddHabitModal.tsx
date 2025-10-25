import { useState } from 'react';
import { FiX, FiZap, FiBookOpen, FiCoffee, FiDroplet, FiMoon, FiSun } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import { createHabit } from '../services';
import styles from './AddHabitModal.module.css'; // Import the CSS Module

interface AddHabitModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const colorOptions = ['blue', 'green', 'red', 'yellow', 'purple', 'pink', 'teal'];
const iconOptions = { FiZap, FiBookOpen, FiCoffee, FiDroplet, FiMoon, FiSun };

export function AddHabitModal({ isOpen, onClose }: AddHabitModalProps) {
    const user = useSelector((state: RootState) => state.auth.user);

    const [title, setTitle] = useState('');
    const [titleError, setTitleError] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
    const [selectedIcon, setSelectedIcon] = useState('FiZap');

    const handleSave = async () => {
        if (!title.trim()) {
            setTitleError('Please enter a title for your habit.');
            return;
        }
        setTitleError(null);
        if (!user) {
            console.error("User not logged in.");
            return;
        }

        const newHabit = {
            title: title,
            color: selectedColor,
            icon: selectedIcon,
        };

        await createHabit(user.uid, newHabit);

        // Reset form and close modal
        setTitle('');
        setSelectedColor(colorOptions[0]);
        setSelectedIcon('FiZap');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalBackdrop}>
            {/* Generic layout classes from Tailwind + our specific component classes from the module */}
            <div className="widget-card w-full max-w-md fade-in-up">
                <div className="flex justify-between items-center">
                    <h2 className="widget-title">Create a New Habit</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <FiX size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* --- Title --- */}
                    <div>
                        <label className="form-label">Title</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., Morning Workout"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                if (titleError) setTitleError(null);
                            }}
                        />
                        {titleError && <p className={styles.formErrorText}>{titleError}</p>}
                    </div>

                    {/* --- Color Picker --- */}
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

                    {/* --- Icon Picker --- */}
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