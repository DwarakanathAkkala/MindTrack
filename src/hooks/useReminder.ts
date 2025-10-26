import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

let notificationInterval: number | null = null;

export const useReminder = () => {
    const habits = useSelector((state: RootState) => state.habits.habits);

    useEffect(() => {
        // If permission isn't granted, do nothing.
        if (!("Notification" in window) || Notification.permission !== 'granted') {
            return;
        }

        // Clean up any existing interval to prevent duplicates
        if (notificationInterval) {
            clearInterval(notificationInterval);
        }

        // Check every 30 seconds for a more accurate trigger
        notificationInterval = window.setInterval(() => {
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            habits.forEach(habit => {
                // Check if a reminder is set for the current time
                if (habit.reminderTime === currentTime) {
                    // Check if the habit is NOT already completed for today
                    // This prevents reminders for habits you've already done.
                    // Note: This requires passing 'logs' to the hook, we'll simplify for now.

                    new Notification("Habit Reminder", {
                        body: `It's time for your habit: "${habit.title}"`,
                        icon: '/vite.svg', // You can replace this with a better app icon
                        tag: habit.id, // Using a tag prevents multiple notifications for the same habit
                    });
                }
            });
        }, 30000); // 30000ms = 30 seconds

        // Cleanup function to clear the interval when the component unmounts
        return () => {
            if (notificationInterval) {
                clearInterval(notificationInterval);
            }
        };
    }, [habits]); // Rerun the effect if the list of habits changes
};