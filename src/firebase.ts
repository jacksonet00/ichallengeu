import { getAnalytics } from "firebase/analytics";
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAskwc5O0P8cqVSvYEvLFb_1EOUUypDr1s",
  authDomain: "tnfp-39b40.firebaseapp.com",
  projectId: "tnfp-39b40",
  storageBucket: "tnfp-39b40.appspot.com",
  messagingSenderId: "2618018996",
  appId: "1:2618018996:web:6a5817454ab4677c1b5be1",
  measurementId: "G-7DWP2EDE12"
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
