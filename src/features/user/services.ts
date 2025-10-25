import { ref, set } from 'firebase/database';
import { db } from '../../lib/firebase'; // Import our initialized database instance

// Define a type for our profile data for better code safety
interface UserProfile {
    name: string;
    focusAreas: string[];
    sleepHours: string;
    priority: string;
    onboardingCompleted: boolean;
    createdAt: string;
}

/**
 * Saves or updates a user's profile data in the Realtime Database.
 * @param userId The unique ID of the user from Firebase Auth.
 * @param profileData The user's profile information.
 */
export const saveUserProfile = async (userId: string, profileData: Omit<UserProfile, 'createdAt'>) => {
    try {
        const profileWithTimestamp = {
            ...profileData,
            createdAt: new Date().toISOString(), // Add a timestamp for when the profile was created
        };
        // We create a reference to a specific location in our database: `userProfiles/[userId]`
        const userProfileRef = ref(db, `userProfiles/${userId}`);

        // 'set' will write the data to that location, overwriting anything that was there before.
        await set(userProfileRef, profileWithTimestamp);

        console.log("✅ User profile saved successfully!");
    } catch (error) {
        console.error("❌ Error saving user profile:", error);
    }
};