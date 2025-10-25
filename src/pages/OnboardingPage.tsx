import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { saveUserProfile } from '../features/user/services';
import { FiZap, FiMoon, FiSun, FiBarChart2, FiCheckCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const TOTAL_STEPS = 2;


export function OnboardingPage() {

    const navigate = useNavigate(); // Hook to navigate to other pages
    const user = useSelector((state: RootState) => state.auth.user);
    const [step, setStep] = useState(1);

    // State for Step 1
    const [name, setName] = useState('');
    const [focusAreas, setFocusAreas] = useState<string[]>([]);

    // State for Step 2
    const [sleepHours, setSleepHours] = useState<string>('');
    const [priority, setPriority] = useState<string>('');

    const progressPercentage = (step / TOTAL_STEPS) * 100;

    const handleFocusAreaToggle = (area: string) => {
        setFocusAreas((prev) =>
            prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
        );
    };

    const handleFinish = async () => {
        if (!user) {
            console.error("Cannot save profile: No user is logged in.");
            return; // Exit if for some reason there is no user
        }

        const profileData = {
            name: name,
            focusAreas: focusAreas,
            sleepHours: sleepHours,
            priority: priority,
            onboardingCompleted: true, // This flag is important for later
        };

        // Call our new service function to save the data
        await saveUserProfile(user.uid, profileData);

        // Redirect the user to their dashboard after completion
        navigate('/dashboard');
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="fade-in-up">
                        <label htmlFor="name" className="form-label">
                            What should we call you?
                        </label>
                        <input
                            id="name"
                            type="text"
                            className="form-input"
                            placeholder="Enter your name..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        <label className="form-label mt-6">
                            Select your primary focus areas:
                        </label>
                        <div className="focus-card-grid">
                            <FocusCard isSelected={focusAreas.includes('Fitness')} onClick={() => handleFocusAreaToggle('Fitness')} icon={<FiZap size={24} />} label="Fitness" />
                            <FocusCard isSelected={focusAreas.includes('Sleep')} onClick={() => handleFocusAreaToggle('Sleep')} icon={<FiMoon size={24} />} label="Sleep" />
                            <FocusCard isSelected={focusAreas.includes('Mindfulness')} onClick={() => handleFocusAreaToggle('Mindfulness')} icon={<FiSun size={24} />} label="Mindfulness" />
                            <FocusCard isSelected={focusAreas.includes('Productivity')} onClick={() => handleFocusAreaToggle('Productivity')} icon={<FiBarChart2 size={24} />} label="Productivity" />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="fade-in-up">
                        <div className="question-card">
                            <p className="question-title">How many hours do you sleep on average?</p>
                            <div className="question-options">
                                <OptionButton isSelected={sleepHours === '5-6'} onClick={() => setSleepHours('5-6')} label="5-6h" />
                                <OptionButton isSelected={sleepHours === '7-8'} onClick={() => setSleepHours('7-8')} label="7-8h" />
                                <OptionButton isSelected={sleepHours === '8+'} onClick={() => setSleepHours('8+')} label="8+ h" />
                            </div>
                        </div>
                        <div className="question-card">
                            <p className="question-title">What's your top priority right now?</p>
                            <div className="question-options">
                                <OptionButton isSelected={priority === 'Consistency'} onClick={() => setPriority('Consistency')} label="Consistency" />
                                <OptionButton isSelected={priority === 'Energy'} onClick={() => setPriority('Energy')} label="More Energy" />
                                <OptionButton isSelected={priority === 'Focus'} onClick={() => setPriority('Focus')} label="Better Focus" />
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="onboarding-container">
            <div className="onboarding-card">
                <h1 className="onboarding-header">
                    {step === 1 ? 'Let’s Get to Know You' : 'Tell Us About Your Routine'}
                </h1>
                <div className="progress-bar-background">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>

                {renderStep()}

                <div className="mt-8 flex items-center justify-between">
                    {/* Back Button: Only shows on steps after the first one */}
                    <div>
                        {step > 1 && (
                            <button
                                className="btn-secondary" // Using our existing secondary button style
                                onClick={() => setStep((s) => s - 1)}
                            >
                                Back
                            </button>
                        )}
                    </div>

                    {/* Next / Finish Button */}
                    <div>
                        {step < TOTAL_STEPS ? (
                            <button
                                className="btn-primary"
                                onClick={() => setStep((s) => s + 1)}
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                className="btn-primary flex items-center"
                                onClick={handleFinish}
                            >
                                <FiCheckCircle className="mr-2" />
                                Finish & Go to Dashboard
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

// Helper Components
function FocusCard({ icon, label, isSelected, onClick }: { icon: React.ReactNode; label: string; isSelected: boolean; onClick: () => void; }) {
    return (<div className={`focus-card ${isSelected ? 'focus-card-selected' : 'focus-card-default'}`} onClick={onClick} > <div className={`transition-transform duration-200 ${isSelected ? 'transform -translate-y-1' : ''}`}> {icon} </div> <span className="mt-2 font-semibold">{label}</span> </div>);
}
function OptionButton({ label, isSelected, onClick }: { label: string; isSelected: boolean; onClick: () => void; }) {
    return (<button className={`option-button ${isSelected ? 'option-button-selected' : 'option-button-default'}`} onClick={onClick} > {label} </button>);
}