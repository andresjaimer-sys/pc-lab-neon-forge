import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDTuKAaTTLmMrbkPamjpS_F0oQlFZ4mbQ8",
  authDomain: "pc-lab-1f0b9.firebaseapp.com",
  projectId: "pc-lab-1f0b9",
  storageBucket: "pc-lab-1f0b9.firebasestorage.app",
  messagingSenderId: "271054677484",
  appId: "1:271054677484:web:e3a1f979a7e843465e4cc9",
  measurementId: "G-TDY4FCTLYV"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
