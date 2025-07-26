import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCyeRB02tH1QVg4aYcpJs7KGHTk1b_aclc",
  authDomain: "lastgoal-tracker.firebaseapp.com",
  projectId: "lastgoal-tracker",
  storageBucket: "lastgoal-tracker.firebasestorage.app",
  messagingSenderId: "957658756496",
  appId: "1:957658756496:web:d74ae48b60ee4863a62f15"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
