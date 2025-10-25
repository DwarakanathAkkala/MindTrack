import { ref, push, set } from 'firebase/database';
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