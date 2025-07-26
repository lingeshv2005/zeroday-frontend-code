import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB5xzz9QLwzFA94vbmeLxjvNcwhu3qtLYY",
  authDomain: "zerothday.firebaseapp.com",
  projectId: "zerothday",
  storageBucket: "zerothday.firebasestorage.app",
  messagingSenderId: "154932821376",
  appId: "1:154932821376:web:5d9b92b48cf75b96955565"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
