// src/services/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';


// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//   appId: import.meta.env.VITE_FIREBASE_APP_ID
// };

const firebaseConfig = {
    apiKey: "AIzaSyBQTrVTTTXDPAIQDGav2rmVY0ffO7LJdkU",
    authDomain: "thinktank-80bac.firebaseapp.com",
    projectId: "thinktank-80bac",
    storageBucket: "thinktank-80bac.firebasestorage.app",
    messagingSenderId: "517802678102",
    appId: "1:517802678102:web:ba436302f6664dfa0628f7",
    measurementId: "G-7WDKWCPWWF"
  };

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);