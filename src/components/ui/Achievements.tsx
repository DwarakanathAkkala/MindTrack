import { useMemo, useState } from 'react';
import { FiAward, FiStar, FiZap, FiShare2, FiCopy } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import styles from './Achievements.module.css';

interface AchievementsProps {
    streak: number;
    userId: string;
}

const achievementTiers = [
    { id: 'streak_3_day', days: 3, label: "3 Day Streak", icon: FiZap, color: "bg-green-500" },
    { id: 'streak_7_day', days: 7, label: "7 Day Streak", icon: FiStar, color: "bg-blue-500" },
    { id: 'streak_30_day', days: 30, label: "30 Day Streak", icon: FiAward, color: "bg-purple-500" },
];

// Helper function to add ordinal suffix (st, nd, rd, th) to a number
const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// Helper to format the date into "30th Oct, 2025"
const formatAchievedDate = (isoDateString: string) => {
    const date = new Date(isoDateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' }); // e.g., 'Oct'
    const year = date.getFullYear();

    const formattedDay = getOrdinal(day);

    return `${formattedDay} ${month}, ${year}`;
};

export function Achievements({ streak, userId }: AchievementsProps) {
    const [copied, setCopied] = useState(false);
    // Get the user profile from the global state
    const userProfile = useSelector((state: RootState) => state.user.profile);

    const shareUrl = `${window.location.origin}/share/${userId}`;

    const unlockedAchievements = useMemo(() => {
        // Get the permanent record of achieved dates from the user profile
        const achievedRecords = userProfile?.achievements || {};

        return achievementTiers.map(tier => ({
            ...tier,
            // Unlocked if permanently recorded OR if the current live streak meets the requirement
            unlocked: !!achievedRecords[tier.id] || streak >= tier.days,
            // Date achieved, if it exists
            achievedDate: achievedRecords[tier.id],
        }));
    }, [streak, userProfile]);

    const handleCopy = () => {
        // Fallback to copying the link for desktop browsers
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } else {
            // Basic alert if clipboard API is not available
            alert(`Share URL: ${shareUrl}`);
        }
    };

    // Check if Web Share API is available for the primary action
    const handleShare = async () => {
        const shareData = {
            title: 'My MindTrack Progress',
            text: `I'm on a ${streak}-day streak! Check out my progress on MindTrack.`,
            url: shareUrl,
        };

        if (navigator.share && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                console.error("Error sharing via native API:", error);
            }
        } else {
            // Fallback to copy link if Web Share API is not available (e.g., desktop browser)
            handleCopy();
        }
    };

    return (
        <div className="widget-card">
            <div className="flex justify-between items-start">
                <h2 className="widget-title">Achievements</h2>
                <button onClick={handleShare} className="btn-secondary !w-auto !text-sm flex items-center gap-2">
                    {copied ? <FiCopy /> : <FiShare2 />}
                    {copied ? 'Copied!' : 'Share'}
                </button>
            </div>
            <div className={`${styles.achievementsGrid} mt-4`}>
                {unlockedAchievements.map(ach => {
                    const Icon = ach.icon;
                    return (
                        <div key={ach.id} className={`${styles.badge} ${ach.unlocked ? styles.badgeUnlocked : ''}`}>
                            <div className={`${styles.badgeIconContainer} ${ach.color}`}>
                                <Icon size={32} className={styles.badgeIcon} />
                            </div>
                            <span className={styles.badgeLabel}>{ach.label}</span>
                            {ach.achievedDate && (
                                <span className="text-xs text-gray-500">
                                    {formatAchievedDate(ach.achievedDate)}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}