// src/services/firebase/auth.ts
import { getAuth, signInAnonymously } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { app, db } from './config';

const auth = getAuth(app);
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

const executeRecaptcha = async (action: string): Promise<string | null> => {
  return new Promise((resolve) => {
    if (!window.grecaptcha) {
      console.error('reCAPTCHA not loaded');
      resolve(null);
      return;
    }

    window.grecaptcha.ready(() => {
      window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action })
        .then(resolve)
        .catch((error) => {
          console.error('reCAPTCHA execution failed:', error);
          resolve(null);
        });
    });
  });
};

const verifyRecaptcha = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch('/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `secret=${import.meta.env.VITE_RECAPTCHA_SECRET_KEY}&response=${token}`
    });
    
    const data = await response.json();
    return data.success && data.score >= 0.5;
  } catch (error) {
    console.error('reCAPTCHA verification failed', error);
    return false;
  }
};

export const signInAnon = async (): Promise<string> => {
  try {
    // Execute reCAPTCHA
    const recaptchaToken = await executeRecaptcha('auth');
    if (!recaptchaToken) {
      throw new Error('reCAPTCHA verification failed');
    }

    // Check for existing user ID in localStorage
    const storedUserId = localStorage.getItem('userId');
    
    if (storedUserId) {
      // Verify existing user
      await verifyExistingUser(storedUserId, recaptchaToken);
      return storedUserId;
    }

    // Sign in anonymously
    const userCredential = await signInAnonymously(auth);
    const uid = userCredential.user.uid;

    // Create user document with verification
    await createUserDocument(uid, recaptchaToken);

    // Store user ID
    localStorage.setItem('userId', uid);
    return uid;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

const createUserDocument = async (uid: string, recaptchaToken: string) => {
  const isVerified = await verifyRecaptcha(recaptchaToken);
  
  await setDoc(doc(db, 'users', uid), {
    createdAt: new Date(),
    recaptchaVerified: isVerified,
    lastVerificationTime: new Date()
  });
};

const verifyExistingUser = async (uid: string, recaptchaToken: string) => {
  const userDocRef = doc(db, 'users', uid);
  // Verify reCAPTCHA
  const isVerified = await verifyRecaptcha(recaptchaToken);

  // Update verification status
  await updateDoc(userDocRef, {
    recaptchaVerified: isVerified,
    lastVerificationTime: new Date()
  });

  if (!isVerified) {
    throw new Error('User verification failed');
  }
};

export const getCurrentUserId = (): string | null => {
  return localStorage.getItem('userId');
};

export const clearUserId = () => {
  localStorage.removeItem('userId');
};

// Secure Firebase call wrapper
export const secureFirebaseCall = async <T>(
  apiCall: () => Promise<T>, 
  userId: string
): Promise<T> => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  const userData = userDoc.data();

  if (!userData?.recaptchaVerified) {
    throw new Error('User not verified');
  }

  return await apiCall();
};