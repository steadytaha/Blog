// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "little-s-blog.firebaseapp.com",
  projectId: "little-s-blog",
  storageBucket: "little-s-blog.appspot.com",
  messagingSenderId: "575517257106",
  appId: "1:575517257106:web:8120673d63d9fd40a1254b",
  measurementId: "G-8N96SYLR3D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;