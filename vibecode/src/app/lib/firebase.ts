import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

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

let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, googleProvider, analytics };