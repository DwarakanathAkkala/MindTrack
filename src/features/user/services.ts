import { ref, update, get } from 'firebase/database';
import { db } from '../../lib/firebase'; // Import our initialized database instance

// Define a type for our profile data for better code safety
export interface UserProfile {
    name: string;
    focusAreas: string[];
    sleepHours: string;
    priority: string;
    onboardingCompleted: boolean;
    createdAt: string;
    height?: number;
    weight?: number;
    birthDate?: string; // YYYY-MM-DD
    primaryGoal?: string;
    photoURL?: string;
}

/**
 * Saves or updates a user's profile data in the Realtime Database.
 * @param userId The unique ID of the user from Firebase Auth.
 * @param profileData The user's profile information.
 */
export const saveUserProfile = async (userId: string, profileData: Partial<UserProfile>) => {
    try {
        const userProfileRef = ref(db, `userProfiles/${userId}`);
        await update(userProfileRef, profileData); // Use 'update'
        console.log("✅ User profile updated successfully!");
    } catch (error) {
        console.error("❌ Error saving user profile:", error);
    }
};


/**
 * Fetches a user's profile from the Realtime Database.
 * @param userId The unique ID of the user.
 * @returns The user's profile data, or null if it doesn't exist.
 */
export const getUserProfile = async (userId: string) => { // 2. Add the new function
    try {
        const userProfileRef = ref(db, `userProfiles/${userId}`);
        const snapshot = await get(userProfileRef);

        if (snapshot.exists()) {
            return snapshot.val(); // Returns the profile object
        } else {
            console.log("No user profile found for this user.");
            return null; // This user is new and has not completed onboarding
        }
    } catch (error) {
        console.error("❌ Error fetching user profile:", error);
        return null;
    }
};

// Checks the streak and updates the profile
export const checkAndAwardAchievement = async (userId: string, currentStreak: number) => {
    if (!userId) return;

    const achievementTiers = [
        { id: 'streak_3_day', days: 3 },
        { id: 'streak_7_day', days: 7 },
        { id: 'streak_30_day', days: 30 },
    ];

    try {
        const profileRef = ref(db, `userProfiles/${userId}`);
        const snapshot = await get(profileRef);
        const profile = snapshot.val() || {};

        const achieved: { [key: string]: string } = profile.achievements || {};
        let updatesMade = false;

        for (const tier of achievementTiers) {
            // If the achievement has not been recorded AND the user has reached the required streak
            if (!achieved[tier.id] && currentStreak >= tier.days) {
                achieved[tier.id] = new Date().toISOString().split('T')[0]; // Save the date achieved
                updatesMade = true;
            }
        }

        if (updatesMade) {
            await update(profileRef, { achievements: achieved });
            console.log("✅ New achievements awarded and saved.");
        }
    } catch (error) {
        console.error("❌ Error checking and awarding achievements:", error);
    }
};