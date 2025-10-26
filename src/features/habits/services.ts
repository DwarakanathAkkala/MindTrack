import { ref, push, set, onValue, update, remove } from 'firebase/database';
import { db } from '../../lib/firebase';

export interface Habit {
    title: string;
    icon: string;
    color: string;
    category: string;
    goal: {
        type: 'reps' | 'duration' | 'steps' | 'checklist';
        target: number;
        unit: string;
    };
    repeat: {
        frequency: 'daily' | 'weekly';
        days?: { [key: string]: boolean };
    };
    subtasks: { [id: string]: { text: string; completed: boolean } };
    startDate: string;
    endDate?: string;
    reminderTime?: string;
}

export const createHabit = async (userId: string, habitData: Omit<Habit, 'id'>) => {
    try {
        const habitsRef = ref(db, `habits/${userId}`);
        const newHabitRef = push(habitsRef);
        await set(newHabitRef, {
            ...habitData,
            createdAt: new Date().toISOString(),
        });
        console.log("✅ New habit created successfully!");
    } catch (error) {
        console.error("❌ Error creating new habit:", error);
    }
};

export const getHabits = (userId: string, callback: (habits: (Habit & { id: string })[]) => void) => {
    const habitsRef = ref(db, `habits/${userId}`);
    const unsubscribe = onValue(habitsRef, (snapshot) => {
        if (snapshot.exists()) {
            const habitsData = snapshot.val();
            const habitsArray = Object.keys(habitsData).map(key => ({
                id: key,
                ...habitsData[key],
            }));
            callback(habitsArray);
        } else {
            callback([]);
        }
    });
    return unsubscribe;
};

export const listenToHabitLogs = (userId: string, callback: (logs: any) => void) => {
    const logsRef = ref(db, `habitLogs/${userId}`);
    const unsubscribe = onValue(logsRef, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.val());
        } else {
            callback(null);
        }
    });
    return unsubscribe;
};

export const logHabitCompletion = async (userId: string, habitId: string, date: string, completed: boolean) => {
    try {
        const logRef = ref(db, `habitLogs/${userId}/${habitId}/${date}`);
        await set(logRef, { completed });
        console.log(`✅ Habit log updated for ${date}`);
    } catch (error) {
        console.error("❌ Error logging habit completion:", error);
    }
};

export const updateHabit = async (userId: string, habitId: string, updates: Partial<Habit>) => {
    try {
        const habitRef = ref(db, `habits/${userId}/${habitId}`);
        await update(habitRef, updates);
        console.log("✅ Habit updated successfully!");
    } catch (error) {
        console.error("❌ Error updating habit:", error);
    }
};

export const deleteHabit = async (userId: string, habitId: string) => {
    try {
        const habitRef = ref(db, `habits/${userId}/${habitId}`);
        await remove(habitRef);
        const logRef = ref(db, `habitLogs/${userId}/${habitId}`);
        await remove(logRef);
        console.log("✅ Habit and logs deleted successfully!");
    } catch (error) {
        console.error("❌ Error deleting habit:", error);
    }
};