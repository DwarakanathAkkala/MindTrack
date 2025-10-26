import { useMemo, useState } from 'react';
import { FiAward, FiStar, FiZap, FiShare2, FiCopy } from 'react-icons/fi';
import styles from './Achievements.module.css';

interface AchievementsProps {
    streak: number;
    userId: string;
}

const achievementTiers = [
    { days: 3, label: "3 Day Streak", icon: FiZap, color: "bg-green-500" },
    { days: 7, label: "7 Day Streak", icon: FiStar, color: "bg-blue-500" },
    { days: 30, label: "30 Day Streak", icon: FiAward, color: "bg-purple-500" },
];

export function Achievements({ streak, userId }: AchievementsProps) {
    const [copied, setCopied] = useState(false);
    const shareUrl = `${window.location.origin}/share/${userId}`;

    const unlockedAchievements = useMemo(() => {
        return achievementTiers.map(tier => ({
            ...tier,
            unlocked: streak >= tier.days,
        }));
    }, [streak]);

    // --- NEW, SMARTER SHARE HANDLER ---
    const handleShare = async () => {
        const shareData = {
            title: 'My Better You Progress',
            text: `I'm on a ${streak}-day streak! Check out my progress on Better You.`,
            url: shareUrl,
        };

        // Check if the Web Share API is available
        if (navigator.share && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
                console.log("Shared successfully!");
            } catch (error) {
                console.error("Error sharing:", error);
            }
        } else {
            // Fallback to copying the link for desktop browsers
            navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="widget-card">
            <div className="flex justify-between items-start">
                <h2 className="widget-title">Achievements</h2>
                <button onClick={handleShare} className="btn-secondary !w-auto !text-sm flex items-center gap-2">
                    {/* We now show a generic 'Share' icon unless it's been copied */}
                    {copied ? <FiCopy /> : <FiShare2 />}
                    {copied ? 'Copied!' : 'Share'}
                </button>
            </div>
            <div className={`${styles.achievementsGrid} mt-4`}>
                {unlockedAchievements.map(ach => {
                    const Icon = ach.icon;
                    return (
                        <div key={ach.days} className={`${styles.badge} ${ach.unlocked ? styles.badgeUnlocked : ''}`}>
                            <div className={`${styles.badgeIconContainer} ${ach.color}`}>
                                <Icon size={32} className={styles.badgeIcon} />
                            </div>
                            <span className={styles.badgeLabel}>{ach.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}