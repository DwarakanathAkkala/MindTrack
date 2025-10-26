import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { getUserProfile } from '../features/user/services';
import type { UserProfile } from '../features/user/services';
import { getHabits, listenToHabitLogs } from '../features/habits/services';
import type { Habit } from '../features/habits/services';
import { Achievements } from '../components/ui/Achievements';
import styles from './SharePage.module.css';

export function SharePage() {
    const { userId } = useParams<{ userId: string }>();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [habits, setHabits] = useState<(Habit & { id: string })[]>([]);
    const [logs, setLogs] = useState<any | null>(null);
    const { width, height } = useWindowSize();

    useEffect(() => {
        if (!userId) return;

        const fetchAllData = async () => {
            const profile = await getUserProfile(userId);
            setUserProfile(profile);

            const habitsUnsubscribe = getHabits(userId, (fetchedHabits) => {
                setHabits(fetchedHabits);
            });

            const logsUnsubscribe = listenToHabitLogs(userId, (fetchedLogs) => {
                setLogs(fetchedLogs);
            });

            return () => {
                habitsUnsubscribe();
                logsUnsubscribe();
            };
        };

        fetchAllData();
    }, [userId]);

    const currentStreak = useMemo(() => {
        if (!logs || habits.length === 0) return 0;
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
            const dateToCheck = new Date(today);
            dateToCheck.setDate(today.getDate() - i);
            const dateStr = dateToCheck.toISOString().split('T')[0];
            const allHabitsForDay = habits.filter(h => new Date(h.startDate) <= dateToCheck && (!h.endDate || new Date(h.endDate) >= dateToCheck));
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

    if (!userProfile) {
        return <div className={styles.sharePageContainer}><p>Loading...</p></div>;
    }

    return (
        <div className={styles.sharePageContainer}>
            {currentStreak > 0 && <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />}
            <div className={styles.shareCard}>
                <img
                    src={`https://ui-avatars.com/api/?name=${userProfile.name.replace(/\s/g, '+')}&background=random&color=fff&size=128`}
                    alt={userProfile.name}
                    className={styles.avatar}
                />
                <h1 className={styles.userName}>{userProfile.name}</h1>
                <p className={styles.shareMessage}>Check my progress on Better You!</p>

                <div className={styles.streakDisplay}>
                    <div className={styles.streakNumber}>{currentStreak}</div>
                    <div className={styles.streakLabel}>Day Streak</div>
                </div>

                <div className="mt-8">
                    {/* We must pass the userId to Achievements on this page */}
                    {userId && <Achievements streak={currentStreak} userId={userId} />}
                </div>

                {/* Convert to Action Link */}
                <Link to="/" className={styles.ctaLink}>
                    Unleash the Better in You through Better You!
                </Link>
            </div>
        </div>
    );
}