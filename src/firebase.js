import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAEiLGTnwefOyqKVb0gCLjadXZEZIMrC8E",
  authDomain: "liad-site.firebaseapp.com",
  projectId: "liad-site",
  storageBucket: "liad-site.firebasestorage.app",
  messagingSenderId: "425891362788",
  appId: "1:425891362788:web:4f7c7251638d2a2093b9f1",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
