import { ref, push, set, onValue } from 'firebase/database';
import { db } from '../../lib/firebase';

// Define a type for the habit data for type safety
export interface Habit {
    title: string;
    icon: string;
    color: string;
    // We will add goal, repeat, etc. here in the future
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