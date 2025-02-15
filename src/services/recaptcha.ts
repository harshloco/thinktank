// src/services/recaptcha.ts
import { useState, useEffect, useCallback } from 'react';
import { loadCaptchaScript, ReCaptcha } from 'react-google-recaptcha3';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase/config';

interface RecaptchaVerificationProps {
  userId: string;
  minimumScore?: number;
}

export const useRecaptchaVerification = ({ 
  userId, 
  minimumScore = 0.5 
}: RecaptchaVerificationProps) => {
  const [isVerified, setIsVerified] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const verifyRecaptcha = useCallback(async (token: string) => {
    try {
      // Client-side verification (limited security)
      const response = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${import.meta.env.VITE_RECAPTCHA_SECRET_KEY}&response=${token}`, 
        { method: 'POST' }
      );
      const data = await response.json();

      if (data.success && data.score >= minimumScore) {
        // Update user verification in Firestore
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, {
          recaptchaVerified: true,
          recaptchaScore: data.score,
          lastVerificationTime: new Date()
        });

        setIsVerified(true);
      } else {
        setIsVerified(false);
      }
    } catch (error) {
      console.error('Recaptcha verification failed', error);
      setIsVerified(false);
    }
  },[minimumScore, userId]);

  useEffect(() => {
    loadCaptchaScript({
      sitekey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
      onSuccess: (recaptcha: ReCaptcha) => {
        recaptcha.execute('submit').then((token) => {
          setRecaptchaToken(token);
          verifyRecaptcha(token);
        });
      }
    });
  }, [userId,verifyRecaptcha]);

  return { 
    isVerified, 
    recaptchaToken 
  };
};