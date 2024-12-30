import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "mychaty-9a0ca.firebaseapp.com",
  projectId: "mychaty-9a0ca",
  storageBucket: "mychaty-9a0ca.firebasestorage.app",
  messagingSenderId: "912547858554",
  appId: "1:912547858554:web:20254bddfa05a5d33793c3"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()