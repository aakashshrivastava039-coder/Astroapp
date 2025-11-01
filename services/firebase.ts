import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

//Your final, live Firebase configuration is now integrated.
// const firebaseConfig = {
//   apiKey: "AIzaSyDs-jG6SzOJBfXpqZ00FSu0NZqf8663gFo",
//   authDomain: "vibe-oracle.firebaseapp.com",
//   projectId: "vibe-oracle",
//   storageBucket: "vibe-oracle.appspot.com",
//   messagingSenderId: "568173399081",
//   appId: "1:568173399081:web:7ee00622d8fcbac6b16038",
//   measurementId: "G-L2GSPZ4TRY"
// };
const firebaseConfig = {
  apiKey: "AIzaSyDs-jG6SzOJBfXpqZ00FSu0NZqf8663gFo",
  authDomain: "vibe-oracle.firebaseapp.com",
  projectId: "vibe-oracle",
  storageBucket: "vibe-oracle.firebasestorage.app",
  messagingSenderId: "568173399081",
  appId: "1:568173399081:web:7ee00622d8fcbac6b16038",
  measurementId: "G-L2GSPZ4TRY"
}
// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
//   measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
// };


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
