import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiSave, FiLock } from 'react-icons/fi';
import type { RootState, AppDispatch } from '../store/store';
import { saveUserProfile, getUserProfile } from '../features/user/services';
import { setUserProfile } from '../features/user/userSlice';
import styles from './ProfilePage.module.css';
import { useToast } from '../context/ToastContext';

export function ProfilePage() {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.auth.user);
    const profile = useSelector((state: RootState) => state.user.profile);
    const { showToast } = useToast(); // 2. Initialize the hook

    // Local form state
    const [name, setName] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [primaryGoal, setPrimaryGoal] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // No more local 'showToast' state needed

    useEffect(() => {
        if (profile) {
            setName(profile.name || user?.displayName || '');
            setHeight(profile.height || '');
            setWeight(profile.weight || '');
            setBirthDate(profile.birthDate || '');
            setPrimaryGoal(profile.primaryGoal || '');
        }
    }, [profile, user]);

    const handleSaveChanges = async () => {
        if (!user) return;
        setIsSaving(true);

        const profileUpdates = {
            name: name || user?.displayName || '',
            height: Number(height) || undefined,
            weight: Number(weight) || undefined,
            birthDate: birthDate || undefined,
            primaryGoal: primaryGoal || undefined,
        };

        await saveUserProfile(user.uid, profileUpdates);

        const updatedProfile = await getUserProfile(user.uid);
        if (updatedProfile) {
            dispatch(setUserProfile(updatedProfile));
        }

        setIsSaving(false);

        // 3. Use the hook to show the toast
        showToast('Changes saved successfully!');
    };

    return (
        // We no longer need the fragment or the <Toast> component here
        <div className={styles.profileLayout}>
            <div className={styles.mainContent}>
                <div className="widget-card">
                    <h1 className="widget-title">Your Profile</h1>
                    <p className="subtitle mb-6">Update your personal information below. This data helps in personalizing your experience.</p>

                    <div className="space-y-6">
                        <div>
                            <label className="form-label">Full Name</label>
                            <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>

                        <div className={styles.inputGroup}>
                            <div className="flex-1">
                                <label className="form-label">Height (cm)</label>
                                <input type="number" className="form-input" value={height} onChange={(e) => setHeight(e.target.value)} />
                            </div>
                            <div className="flex-1">
                                <label className="form-label">Weight (kg)</label>
                                <input type="number" className="form-input" value={weight} onChange={(e) => setWeight(e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Birth Date</label>
                            <input type="date" className="form-input" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                        </div>

                        <div>
                            <label className="form-label">My Primary Goal</label>
                            <textarea
                                className="form-input"
                                rows={3}
                                placeholder="e.g., Run a 5k, improve sleep, learn a new skill..."
                                value={primaryGoal}
                                onChange={(e) => setPrimaryGoal(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="flex justify-end">
                            <button onClick={handleSaveChanges} className="btn-primary flex items-center justify-center !w-auto" disabled={isSaving}>
                                <FiSave className="mr-2" />
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <aside className={styles.sidebar}>
                <div className={styles.privacyCard}>
                    <FiLock size={32} className="text-blue-500 flex-shrink-0" />
                    <div>
                        <h3 className="font-bold text-blue-800">Your Privacy is Our Priority</h3>
                        <p className={styles.privacyText}>
                            Your personal data is only used to enhance your app experience. We will never share or sell your information to any third-party advertisers.
                        </p>
                    </div>
                </div>
            </aside>
        </div>
    );
}