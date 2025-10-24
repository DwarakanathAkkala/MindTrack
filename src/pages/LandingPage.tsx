import { Zap } from 'lucide-react';
import { signInWithGoogle } from '../features/auth/services';

export function LandingPage() {
    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="landing-card">

                <div className="logo-container">
                    <div className="logo">
                        <Zap className="text-white" size={32} />
                    </div>
                </div>

                <div className="text-center">
                    <h1 className="title">
                        Wellness Tracker
                    </h1>
                    <p className="subtitle">
                        Track your habits. Balance your mind. Reach your goals.
                    </p>
                </div>

                <div className="space-y-4">
                    <button className="btn-primary" onClick={signInWithGoogle}>
                        Sign In with Google
                    </button>
                    <button className="btn-secondary">
                        Sign Up
                    </button>
                </div>

            </div>
        </div>
    );
}