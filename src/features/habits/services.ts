import { ref, push, set, onValue, update, remove } from 'firebase/database';
import { db } from '../../lib/firebase';

// Define a type for the habit data for type safety
export interface Habit {
    title: string;
    icon: string;
    color: string;
    goal: {
        type: 'reps' | 'duration' | 'checklist';
        target: number;
        unit: string;
    };
    repeat: {
        frequency: 'daily' | 'weekly';
        days?: { [key: string]: boolean }; // e.g., { Mon: true, Wed: true }
    };
    subtasks: { [id: string]: { text: string; completed: boolean } };
}

/**
 * Creates a new habit for a specific user in the database.
 * @param userId The unique ID of the user.
 * @param habitData The data for the new habit.
 */
export const createHabit = async (userId: string, habitData: Habit) => {
    try {
        // Create a reference to the user's list of habits
        const habitsRef = ref(db, `habits/${userId}`);

        // 'push' generates a new unique key (like a habitId) in the list
        const newHabitRef = push(habitsRef);

        // 'set' the data for the new habit at that unique key
        await set(newHabitRef, {
            ...habitData,
            createdAt: new Date().toISOString(), // Add a timestamp
        });

        console.log("✅ New habit created successfully!");
    } catch (error) {
        console.error("❌ Error creating new habit:", error);
    }
};


/**
 * Listens for real-time updates to a user's habits.
 * @param userId The unique ID of the user.
 * @param callback The function to call with the new list of habits.
 * @returns A function to unsubscribe from the listener.
 */
export const getHabits = (userId: string, callback: (habits: any[]) => void) => { // 2. Add the new function
    const habitsRef = ref(db, `habits/${userId}`);

    // onValue sets up the listener. It will fire once immediately, and then
    // again every time the data at this location changes.
    const unsubscribe = onValue(habitsRef, (snapshot) => {
        if (snapshot.exists()) {
            const habitsData = snapshot.val();
            // Firebase returns an object, so we convert it to an array
            const habitsArray = Object.keys(habitsData).map(key => ({
                id: key,
                ...habitsData[key],
            }));
            callback(habitsArray);
        } else {
            // If no habits exist, return an empty array
            callback([]);
        }
    });

    // Return the unsubscribe function so we can stop listening later
    return unsubscribe;
}


/**
 * Logs the completion status of a habit for a specific day.
 * @param userId The user's ID.
 * @param habitId The ID of the habit.
 * @param date The date in YYYY-MM-DD format.
 * @param completed The completion status.
 */
export const logHabitCompletion = async (userId: string, habitId: string, date: string, completed: boolean) => {
    try {
        const logRef = ref(db, `habitLogs/${userId}/${habitId}/${date}`);
        await set(logRef, { completed });
        console.log(`✅ Habit log updated for ${date}`);
    } catch (error) {
        console.error("❌ Error logging habit completion:", error);
    }
};

/**
 * Updates the data for an existing habit.
 * @param userId The user's ID.
 * @param habitId The ID of the habit to update.
 * @param updates An object containing the fields to update.
 */
export const updateHabit = async (userId: string, habitId: string, updates: Partial<Habit>) => {
    try {
        const habitRef = ref(db, `habits/${userId}/${habitId}`);
        await update(habitRef, updates);
        console.log("✅ Habit updated successfully!");
    } catch (error) {
        console.error("❌ Error updating habit:", error);
    }
};


/**
 * Deletes a specific habit for a user.
 * @param userId The user's ID.
 * @param habitId The ID of the habit to delete.
 */
export const deleteHabit = async (userId: string, habitId: string) => {
    try {
        const habitRef = ref(db, `habits/${userId}/${habitId}`);
        await remove(habitRef);
        // We should also delete the habit's logs, but we'll add that later for simplicity.
        console.log("✅ Habit deleted successfully!");
    } catch (error) {
        console.error("❌ Error deleting habit:", error);
    }
};