// src/lib/firebaseAdmin.js — Server-side Firebase Admin SDK
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';


// Lazy initialization for Firebase Admin
let adminAuthInstance = null;
let adminDbInstance = null;

function getAdmin() {
    if (getApps().length === 0) {
        if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY) {
            console.warn('Firebase Admin credentials missing. Skipping initialization during build.');
            return null;
        }

        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    }
    return getApps()[0];
}

export const adminAuth = {
    verifyIdToken: async (token) => {
        const app = getAdmin();
        if (!app) throw new Error('Firebase Admin not initialized');
        if (!adminAuthInstance) adminAuthInstance = getAuth(app);
        return adminAuthInstance.verifyIdToken(token);
    }
};

export const adminDb = new Proxy({}, {
    get(target, prop) {
        const app = getAdmin();
        if (!app) throw new Error('Firebase Admin not initialized');
        if (!adminDbInstance) adminDbInstance = getFirestore(app);
        return adminDbInstance[prop];
    }
});
