// src/services/firebase/auth.ts
import { getAuth, signInAnonymously } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { app, db } from './config';

const auth = getAuth(app);

export const signInAnon = async (): Promise<string> => {
  try {
    // Check for existing user ID in localStorage
    const storedUserId = localStorage.getItem('userId');
    
    if (storedUserId) {
      return storedUserId;
    }

    // Sign in anonymously
    const userCredential = await signInAnonymously(auth);
    const uid = userCredential.user.uid;

    // Create user document
    await createUserDocument(uid);

    // Store user ID
    localStorage.setItem('userId', uid);
    return uid;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

const createUserDocument = async (uid: string) => {
  await setDoc(doc(db, 'users', uid), {
    createdAt: new Date()
  });
};

export const getCurrentUserId = (): string | null => {
  return localStorage.getItem('userId');
};

export const clearUserId = () => {
  localStorage.removeItem('userId');
};