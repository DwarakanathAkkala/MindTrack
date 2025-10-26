import { useSelector } from 'react-redux';
import { FiTrendingUp, FiCheckCircle, FiPieChart } from 'react-icons/fi';
import type { RootState } from '../store/store';
import styles from './InsightsPage.module.css';

export function InsightsPage() {
    const habits = useSelector((state: RootState) => state.habits.habits);
    const logs = useSelector((state: RootState) => state.logs.logs);

    const totalHabits = habits.length;

    const { totalLogs, totalCompleted } = (() => {
        if (!logs || !habits || habits.length === 0) return { totalLogs: 0, totalCompleted: 0 };
        let completed = 0;
        let total = 0;

        habits.forEach(habit => {
            const habitLogs = logs[habit.id];
            if (habitLogs) {
                Object.values(habitLogs as object).forEach(log => {
                    if (log.completed) completed++;
                    total++;
                });
            }
        });

        return { totalLogs: total, totalCompleted: completed };
    })();

    const overallCompletion = totalLogs > 0 ? Math.round((totalCompleted / totalLogs) * 100) : 0;

    const categoryStats = (() => {
        const stats: { [category: string]: { total: number; completed: number; color: string } } = {};
        if (!logs || !habits) return [];

        habits.forEach(habit => {
            const category = habit.category || 'General';
            if (!stats[category]) {
                stats[category] = { total: 0, completed: 0, color: habit.color };
            }

            const habitLogs = logs[habit.id];
            if (habitLogs) {
                const logEntries = Object.values(habitLogs);
                stats[category].total += logEntries.length;
                stats[category].completed += logEntries.filter((log: any) => log.completed).length;
            }
        });

        return Object.entries(stats).map(([category, data]) => ({
            category,
            color: data.color,
            percentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
        }));
    })();

    return (
        <div className="space-y-6">
            <div className="widget-card">
                <h1 className="widget-title">Your Progress Insights</h1>
                <div className={styles.insightsGrid}>
                    <div className={styles.statCard}>
                        <h2 className={styles.statTitle}><FiCheckCircle className="text-green-500" /> Overall Completion</h2>
                        <p className={styles.statValue}>{overallCompletion}%</p>
                        <p className={styles.statDescription}>You've completed {totalCompleted} of {totalLogs} tracked entries.</p>
                    </div>
                    <div className={styles.statCard}>
                        <h2 className={styles.statTitle}><FiTrendingUp className="text-blue-500" /> Active Habits</h2>
                        <p className={styles.statValue}>{totalHabits}</p>
                        <p className={styles.statDescription}>You are currently tracking {totalHabits} habits.</p>
                    </div>
                </div>
            </div>

            <div className="widget-card">
                <h2 className={styles.statTitle}><FiPieChart className="text-purple-500" /> Completion by Category</h2>
                <div className={styles.categoryList}>
                    {categoryStats.length === 0 && <p className="text-gray-500">No completion data yet to show category stats.</p>}
                    {categoryStats.map(({ category, color, percentage }) => (
                        <div key={category} className={styles.categoryItem}>
                            <div className={`${styles.categoryColorSwatch} color-${color}`}></div>
                            <p className={styles.categoryLabel}>{category}</p>
                            <div className={styles.progressBarBackground}>
                                <div className={`${styles.progressBarFill} color-${color}`} style={{ width: `${percentage}%` }}></div>
                            </div>
                            <p className="font-semibold">{percentage}%</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}