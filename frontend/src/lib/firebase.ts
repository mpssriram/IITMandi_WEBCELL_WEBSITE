import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBGeHafoA54X4xNnObBzeL_b_PEf0-oKpI",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "devcell-73309.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "devcell-73309",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "devcell-73309.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "73967239639",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:73967239639:web:2edc421657bc1859764b92",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
