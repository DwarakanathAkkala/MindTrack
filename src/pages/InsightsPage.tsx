import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { FiTrendingUp, FiCheckCircle, FiPieChart, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import type { RootState } from '../store/store';
import styles from './InsightsPage.module.css';

export function InsightsPage() {
    const habits = useSelector((state: RootState) => state.habits.habits);
    const logs = useSelector((state: RootState) => state.logs.logs);

    const [filterDate, setFilterDate] = useState(new Date());
    const filterMonth = filterDate.getMonth();
    const filterYear = filterDate.getFullYear();

    const filteredLogs = useMemo(() => {
        if (!logs) return null;
        const filtered: any = {};
        Object.entries(logs).forEach(([habitId, habitLogs]) => {
            const filteredHabitLogs: any = {};
            Object.entries(habitLogs as object).forEach(([dateStr, log]) => {
                const logDate = new Date(dateStr);
                if (logDate.getFullYear() === filterYear && logDate.getMonth() === filterMonth) {
                    filteredHabitLogs[dateStr] = log;
                }
            });
            if (Object.keys(filteredHabitLogs).length > 0) {
                filtered[habitId] = filteredHabitLogs;
            }
        });
        return filtered;
    }, [logs, filterMonth, filterYear]);

    const totalHabits = habits.length;

    const { totalLogs, totalCompleted } = useMemo(() => {
        if (!filteredLogs || !habits || habits.length === 0) return { totalLogs: 0, totalCompleted: 0 };
        let completed = 0, total = 0;
        habits.forEach(habit => {
            const habitLogs = filteredLogs[habit.id];
            if (habitLogs) {
                Object.values(habitLogs as object).forEach(log => {
                    if (log.completed) completed++;
                    total++;
                });
            }
        });
        return { totalLogs: total, totalCompleted: completed };
    }, [filteredLogs, habits]);

    const overallCompletion = totalLogs > 0 ? Math.round((totalCompleted / totalLogs) * 100) : 0;

    const categoryStats = useMemo(() => {
        const stats: { [category: string]: { total: number; completed: number; color: string } } = {};
        if (!filteredLogs || !habits) return [];

        habits.forEach(habit => {
            const category = habit.category || 'General';
            if (!stats[category]) {
                stats[category] = { total: 0, completed: 0, color: habit.color };
            }

            const habitLogs = filteredLogs[habit.id];
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
    }, [filteredLogs, habits]);

    return (
        <div className="space-y-6">
            <div className="widget-card">
                {/* REPLICATED MONTH NAVIGATOR LOGIC */}
                <div className="flex justify-between items-start mb-4">
                    <h1 className="widget-title">
                        {`${filterDate.toLocaleString('default', { month: 'long' })} ${filterYear}`} Insights
                    </h1>
                    <div className="flex items-center">
                        <button
                            onClick={() => setFilterDate(new Date(filterYear, filterMonth - 1, 1))}
                            className="p-1 rounded-full hover:bg-gray-100"
                        >
                            <FiChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => setFilterDate(new Date(filterYear, filterMonth + 1, 1))}
                            className="p-1 rounded-full hover:bg-gray-100"
                        >
                            <FiChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className={styles.insightsGrid}>
                    <div className={styles.statCard}>
                        <h2 className={styles.statTitle}><FiCheckCircle className="text-green-500" /> Monthly Completion</h2>
                        <p className={styles.statValue}>{overallCompletion}%</p>
                        <p className={styles.statDescription}>You've completed {totalCompleted} of {totalLogs} tracked entries this month.</p>
                    </div>
                    <div className={styles.statCard}>
                        <h2 className={styles.statTitle}><FiTrendingUp className="text-blue-500" /> Active Habits</h2>
                        <p className={styles.statValue}>{totalHabits}</p>
                        <p className={styles.statDescription}>You are currently tracking {totalHabits} habits.</p>
                    </div>
                </div>
            </div>

            <div className="widget-card">
                <h2 className={styles.statTitle}><FiPieChart className="text-purple-500" /> Completion by Category (This Month)</h2>
                <div className={styles.categoryList}>
                    {categoryStats.length === 0 && <p className="text-gray-500">No completion data for this month.</p>}
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