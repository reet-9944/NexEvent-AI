// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For actual deployment, you would replace this with env vars
const firebaseConfig = {
  apiKey: "AIzaSyMockKeyForFrontendEvaluation",
  authDomain: "nexevent-ai-eval.firebaseapp.com",
  projectId: "nexevent-ai-eval",
  storageBucket: "nexevent-ai-eval.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
