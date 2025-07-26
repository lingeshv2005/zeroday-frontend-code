// src/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';  // <-- Add this import

const firebaseConfig = {
  apiKey: 'AIzaSyB5xzz9QLwzFA94vbmeLxjvNcwhu3qtLYY',
  authDomain: 'zerothday.firebaseapp.com',
  projectId: 'zerothday',
  storageBucket: 'zerothday.appspot.com',
  messagingSenderId: '154932821376',
  appId: '1:154932821376:android:02e81bad9f077b20955565',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
