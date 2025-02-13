// src/services/firebase/auth.ts
import { getAuth, signInAnonymously } from 'firebase/auth';
import { app } from './config';

const auth = getAuth(app);

export const signInAnon = async (): Promise<string> => {
  try {
    // Check if user ID is already in localStorage
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      return storedUserId;
    }

    // Perform anonymous sign-in
    const userCredential = await signInAnonymously(auth);
    const uid = userCredential.user.uid;

    // Store user ID in localStorage
    localStorage.setItem('userId', uid);

    return uid;
  } catch (error) {
    console.error('Anonymous authentication error:', error);
    throw error;
  }
};

export const getCurrentUserId = (): string | null => {
  return localStorage.getItem('userId');
};

export const clearUserId = () => {
  localStorage.removeItem('userId');
};