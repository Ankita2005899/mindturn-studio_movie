import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCCwZ1gVeRI3tsWLYm0wkQeSHKXg5_oclM",
  authDomain: "mindturn-studio.firebaseapp.com",
  projectId: "mindturn-studio",
  storageBucket: "mindturn-studio.firebasestorage.app",
  messagingSenderId: "900322463450",
  appId: "1:900322463450:web:28160b2309eb5d4ffc9fe3",
  measurementId: "G-MY1HN2VCJM",
};

// Initialize Firebase
export const FirebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(FirebaseApp);
export const storage = getStorage(FirebaseApp);
const analytics = getAnalytics(FirebaseApp);
