// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// TODO: Replace the following with your app's Firebase project configuration
// You can get this from the Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: "AIzaSyD6QqfkwTzTYAhHKLWJvDUXZbYyG8y7TKI",
  authDomain: "vibecoding-22dd7.firebaseapp.com",
  projectId: "vibecoding-22dd7",
  storageBucket: "vibecoding-22dd7.firebasestorage.app",
  messagingSenderId: "813247632406",
  appId: "1:813247632406:web:93c8433f27170466b9d137",
  measurementId: "G-HWDBB8Q6WC"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);
const rtdb = getDatabase(app);

export { auth, googleProvider, db, rtdb };
