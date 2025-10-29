import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your final, live Firebase configuration is now integrated.
const firebaseConfig = {
  apiKey: "AIzaSyDs-jG6SzOJBfXpqZ00FSu0NZqf8663gFo",
  authDomain: "vibe-oracle.firebaseapp.com",
  projectId: "vibe-oracle",
  storageBucket: "vibe-oracle.appspot.com",
  messagingSenderId: "568173399081",
  appId: "1:568173399081:web:7ee00622d8fcbac6b16038",
  measurementId: "G-L2GSPZ4TRY"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();