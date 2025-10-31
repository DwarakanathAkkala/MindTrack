import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { FiAward, FiStar, FiZap, FiUser } from 'react-icons/fi'; // Ensure FiUser is imported
import { getUserProfile } from '../features/user/services';
import type { UserProfile } from '../features/user/services';
import { getHabits, listenToHabitLogs } from '../features/habits/services';
import type { Habit } from '../features/habits/services';
import styles from './SharePage.module.css';

// Simplified achievement tiers for display logic
const achievementTiers = [
    { days: 3, label: "3 Days", icon: FiZap, color: "bg-green-500" },
    { days: 7, label: "7 Days", icon: FiStar, color: "bg-blue-500" },
    { days: 30, label: "30 Days", icon: FiAward, color: "bg-purple-500" },
];

// Helper component for the badges (must be local to this file or imported)
function AchBadge({ icon: Icon, color, label }: { icon: any; color: string; label: string }) {
    return (
        <div className={`${styles.achievementBadge} ${color}`}>
            <Icon size={20} />
            <span className="mt-1 leading-none">{label}</span>
        </div>
    );
}


export function SharePage() {
    const { userId } = useParams<{ userId: string }>();
    const [isLoading, setIsLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [habits, setHabits] = useState<(Habit & { id: string })[]>([]);
    const [logs, setLogs] = useState<any | null>(null);
    const { width, height } = useWindowSize();

    useEffect(() => {
        if (!userId) return;
        let isMounted = true;

        // Simpler, cleaner fetch that removes photoURL complexity
        const fetchAllData = async () => {
            const profileData = await getUserProfile(userId);
            if (isMounted) setUserProfile(profileData);
        };
        fetchAllData();

        const habitsUnsubscribe = getHabits(userId, (fetchedHabits) => {
            if (isMounted) setHabits(fetchedHabits);
        });

        const logsUnsubscribe = listenToHabitLogs(userId, (fetchedLogs) => {
            if (isMounted) {
                setLogs(fetchedLogs);
                setIsLoading(false);
            }
        });

        return () => {
            isMounted = false;
            habitsUnsubscribe();
            logsUnsubscribe();
        };
    }, [userId]);

    const currentStreak = useMemo(() => {
        if (!logs || !habits || habits.length === 0) return 0;
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
            const dateToCheck = new Date(today);
            dateToCheck.setDate(today.getDate() - i);
            const dateStr = dateToCheck.toISOString().split('T')[0];
            const allHabitsForDay = habits.filter(h => h.startDate <= dateStr && (!h.endDate || h.endDate >= dateStr));
            if (allHabitsForDay.length === 0) {
                if (i === 0) return 0;
                break;
            }
            if (allHabitsForDay.reduce((count, h) => (logs[h.id]?.[dateStr]?.completed ? count + 1 : count), 0) === allHabitsForDay.length) {
                streak++;
            } else {
                if (i === 0) return 0;
                break;
            }
        }
        return streak;
    }, [habits, logs]);

    const unlockedAchievements = useMemo(() => {
        return achievementTiers.filter(tier => currentStreak >= tier.days);
    }, [currentStreak]);

    if (isLoading || !userProfile || !userId) {
        return <div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>;
    }

    const showConfetti = currentStreak >= 30; // Only show confetti for the highest achievement

    return (
        <div className={styles.sharePageContainer}>
            {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={300} />}
            <div className={styles.shareCard}>

                {/* Use the new container class */}
                <div className={styles.simpleFallbackAvatar}>
                    <FiUser size={32} />
                </div>


                <h1 className={styles.userName}>{userProfile.name}</h1>
                <p className={styles.shareMessage}>Check my progress on Better You 🎯</p>

                <div className={styles.streakDisplay}>
                    <div className="flex items-center justify-center gap-3">
                        <span className="text-4xl">🔥</span>
                        <div className="flex flex-col items-start">
                            <div className={styles.streakNumber}>{currentStreak}</div>
                            <div className={styles.streakLabel}>Day Streak</div>
                        </div>
                    </div>
                </div>

                {/* ACHIEVEMENTS FIX: Use the new flex layout */}
                {unlockedAchievements.length > 0 && (
                    <>
                        <p className="font-semibold mt-6 text-gray-700">MY ACHIEVEMENTS</p>
                        <div className={styles.achievementList}>
                            {unlockedAchievements.map(ach => {
                                const Icon = ach.icon;
                                return <AchBadge key={ach.days} icon={Icon} color={ach.color} label={ach.label} />;
                            })}
                        </div>
                    </>
                )}

                <Link to="/" className={styles.ctaLink}>
                    Be the Better You. Let's go! 💪
                </Link>
            </div>
        </div>
    );
}