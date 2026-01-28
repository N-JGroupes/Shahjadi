
// FIX: Use modular imports from Firebase v9 SDK for compatibility.
import { initializeApp } from "firebase/app";
import { 
    getFirestore, 
    collection, 
    onSnapshot, 
    doc, 
    getDoc, 
    setDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    writeBatch,
    getCountFromServer 
} from "firebase/firestore";
import { 
    getAuth, 
    onAuthStateChanged, 
    signInAnonymously, 
    signOut 
} from "firebase/auth";
import { INITIAL_MEMBERS } from '../initialData';

// --- Firebase Configuration ---
// The configuration is now sourced from environment variables for security.
// These variables must be set in the deployment environment.

/*
 * ==========================================================================
 *  IMPORTANT: SETUP FIREBASE ENVIRONMENT VARIABLES
 * ==========================================================================
 *  To connect this app to your Firebase project, you MUST set the following
 *  environment variables in your hosting provider's settings (e.g., Vercel,
 *  Netlify, or the platform you are using).
 *
 *  Copy these values from your Firebase project's settings.
 *
 *  1. FIREBASE_API_KEY="YOUR_API_KEY"
 *  2. FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
 *  3. FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
 *  4. FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
 *  5. FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
 *  6. FIREBASE_APP_ID="YOUR_APP_ID"
 *
 * ==========================================================================
 */
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// --- Initialize Firebase ---
// A check is added to ensure Firebase doesn't initialize with undefined values.
let app: any; 
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    // FIX: Use modular `initializeApp` function from `firebase/app`.
    app = initializeApp(firebaseConfig);
  } catch (e) {
    console.error("Firebase initialization failed:", e);
    app = {}; // Assign dummy object on error
  }
} else {
  console.warn("Firebase configuration is missing. The app will run in offline mode. Please set up your environment variables for online functionality.");
  // Provide a dummy app object to prevent downstream errors, though Firebase will not work.
  app = {}; 
}

// FIX: Use modular `getFirestore` and `getAuth` functions.
export const db: any = app.options ? getFirestore(app) : {};
export const auth: any = app.options ? getAuth(app) : {};

// --- Export original Firebase functions for direct use ---
// FIX: Re-export modular functions directly.
export {
    collection,
    onSnapshot,
    doc,
    getDoc,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    writeBatch,
    getAuth,
    onAuthStateChanged,
    signInAnonymously,
    signOut
};


// --- Seeding function (run once to populate the database) ---
export const seedInitialData = async () => {
    // FIX: Updated check to be compatible with Firebase v9. `db.app` confirms a valid Firestore instance.
    if (!app.options || !db.app) return;

    try {
        const membersCollection = collection(db, "members");
        // FIX: Use modular `getCountFromServer` function from `firebase/firestore`.
        const snapshot = await getCountFromServer(membersCollection);
        
        if (snapshot.data().count > 0) {
            console.log("Data already exists in Firestore. Seeding skipped.");
            return;
        }

        console.log("Seeding initial member and config data to Firestore...");
        // FIX: Use modular `writeBatch` function.
        const batch = writeBatch(db);
        
        // Seed members
        INITIAL_MEMBERS.forEach((member) => {
            // FIX: Use modular `doc` function.
            const memberRef = doc(db, "members", member.id);
            batch.set(memberRef, member);
        });
        
        // Seed initial config
        // FIX: Use modular `doc` function.
        const configRef = doc(db, "config", "main");
        batch.set(configRef, {
            backupEmail: 'njgroupbangladesh@gmail.com',
            adminPassword: '825646',
            homeIconUrl: '',
            welcomeAudioUrl: 'https://image2url.com/r2/default/audio/1769316418293-46bb57b7-03a1-496a-b671-75064aaf36f1.wav',
            loginAudioUrl: 'https://image2url.com/r2/default/audio/1769316517283-1b4c0f43-ad17-468a-985d-8c835e7eab14.wav',
            adminProfileImageUrl: '',
            lastBackup: ''
        });

        await batch.commit();
        console.log("Seeding complete.");
    } catch (error) {
        console.error("Error seeding data:", error);
        if (error.message.includes("Missing or insufficient permissions")) {
            alert("Firestore ডাটাবেসের পারমিশন চেক করুন। ডাটাবেজ এখনও সেটআপ করা হয়নি।");
        }
    }
};
