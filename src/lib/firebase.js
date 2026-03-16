// src/lib/firebase.js — Client-side Firebase SDK
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (process.env.NODE_ENV === 'development') {
    console.log('Firebase Config loaded:', {
        apiKey: !!firebaseConfig.apiKey,
        authDomain: !!firebaseConfig.authDomain,
        projectId: firebaseConfig.projectId,
        appId: !!firebaseConfig.appId,
    });
}

const isConfigValid = !!firebaseConfig.apiKey;

// Prevent re-initialisation in Next.js hot-reload
let app;
if (isConfigValid) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
}

// Build-safe mock for Firebase Auth
const mockAuth = new Proxy({
    onAuthStateChanged: () => () => { },
    currentUser: null,
    signOut: () => Promise.resolve(),
}, {
    get: (target, prop) => {
        if (prop in target) return target[prop];
        // For any other access (like internal Firebase SDK methods), return a no-op
        return () => {
            if (typeof window !== 'undefined' && !isConfigValid) {
                console.error(`Firebase error: Attempted to access "auth.${prop}" but Firebase is not initialized. Check your NEXT_PUBLIC_FIREBASE environment variables.`);
            }
            return Promise.reject(new Error('Firebase not initialized'));
        };
    }
});

export const auth = isConfigValid ? getAuth(app) : mockAuth;

const dummyColl = () => ({
    doc: () => ({
        get: () => Promise.resolve({ exists: false, data: () => ({}) }),
        set: () => Promise.resolve(),
        update: () => Promise.resolve(),
        onSnapshot: () => () => { },
    }),
    where: () => ({ get: () => Promise.resolve({ docs: [] }) }),
});

export const db = isConfigValid ? getFirestore(app) : new Proxy({}, {
    get: (target, prop) => {
        if (prop === 'collection') return dummyColl;
        return () => ({ doc: () => ({ get: () => Promise.resolve({ exists: false }) }) });
    }
});

export default app;
