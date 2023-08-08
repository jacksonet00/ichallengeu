import { getAnalytics } from "firebase/analytics";
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCBgP04cmrnEibT0555Ez7tzg38q18_To0",
  authDomain: "ichallengeu-b8e90.firebaseapp.com",
  projectId: "ichallengeu-b8e90",
  storageBucket: "ichallengeu-b8e90.appspot.com",
  messagingSenderId: "102482276790",
  appId: "1:102482276790:web:36c574642c5b8bc48e1117",
  measurementId: "G-NT5ELJP24T"
};

export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const getAnalyticsSafely = () => {
  if (typeof window !== "undefined") {
    return getAnalytics(app);
  } else {
    return null;
  }
};

export const auth = getAuth(app);

export const storage = getStorage(app);