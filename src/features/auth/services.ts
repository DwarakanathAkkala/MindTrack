import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../../lib/firebase'; // We import our initialized auth service

// Create a new instance of the Google provider
const provider = new GoogleAuthProvider();

/**
 * Triggers the Google Sign-In popup flow.
 * @returns A Promise that resolves with the signed-in user's information, or null if it fails.
 */
export const signInWithGoogle = async (): Promise<User | null> => {
    try {
        const result = await signInWithPopup(auth, provider);
        // The signed-in user info is in result.user
        const user = result.user;
        console.log("✅ User signed in successfully:", user); // For testing
        return user;
    } catch (error) {
        console.error("❌ Error during Google sign-in:", error);
        return null;
    }
};