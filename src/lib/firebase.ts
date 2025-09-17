
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User, sendPasswordResetEmail, confirmPasswordReset } from "firebase/auth";
import { getFirestore, serverTimestamp as firestoreTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB2RfoXKSSROHCJYOwu7T4UzcpohExJwIw",
  authDomain: "store-management-5de36.firebaseapp.com",
  projectId: "store-management-5de36",
  storageBucket: "store-management-5de36.firebasestorage.app",
  messagingSenderId: "53560336506",
  appId: "1:53560336506:web:d3cb29ed51d9e669ed9bc3",
  measurementId: "G-5JHB5LNKP8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const serverTimestamp = firestoreTimestamp;

// Auth functions
export const registerUser = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async () => {
  return signOut(auth);
};

// Password reset functions
export const sendPasswordResetEmailToUser = async (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

export const resetPassword = async (oobCode: string, newPassword: string) => {
  return confirmPasswordReset(auth, oobCode, newPassword);
};

// Date formatting helper
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Time formatting helper
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format date and time
export const formatDateTime = (date: Date): string => {
  return `${formatDate(date)} ${formatTime(date)}`;
};
