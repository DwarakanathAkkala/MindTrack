import { FiArrowRight, FiLogIn } from 'react-icons/fi';
import { signInWithGoogle } from '../features/auth/services';
import logoSrc from '../assets/logoIcon.webp';
import heroSVG from '../assets/hero.svg';

export function LandingPage() {
    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header with Logo */}
            <header className="absolute top-0 left-0 w-full p-6">
                <div className="flex items-center gap-3">
                    <img src={logoSrc} alt="MindTrack Logo" className="h-20 w-20" />
                    <span className="text-xl font-bold text-gray-800">Better You</span>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex items-center justify-center min-h-screen px-6 py-24">
                <div className="landing-grid max-w-6xl w-full">

                    {/* Left Column: Content */}
                    <div className="landing-content">
                        <h1 className="landing-title fade-in-up" style={{ animationDelay: '100ms' }}>
                            Build Habits,<br />Balance Your Mind.
                        </h1>
                        <p className="landing-subtitle fade-in-up" style={{ animationDelay: '200ms' }}>
                            Better You is your personal wellness companion, designed to help you track your habits, balance your mind, and achieve your goals with clarity and focus.
                        </p>
                        <div className="landing-cta-group fade-in-up" style={{ animationDelay: '300ms' }}>
                            <button onClick={signInWithGoogle} className="btn-accent flex items-center justify-center gap-2 !w-full sm:!w-auto">
                                Get Started for Free
                                <FiLogIn />
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Illustration */}
                    <div className="flex justify-center items-center fade-in-up" style={{ animationDelay: '400ms' }}>
                        <img
                            src={heroSVG}
                            alt="Person organizing tasks"
                            className="w-full max-w-md lg:max-w-lg"
                        />
                    </div>

                </div>
            </main>
        </div>
    );
}