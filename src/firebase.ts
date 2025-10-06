// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBslHWNGVA4yBS5sy--7Q3IVokyPK3kNHw",
  authDomain: "suicide-king-wow.firebaseapp.com",
  projectId: "suicide-king-wow",
  storageBucket: "suicide-king-wow.appspot.com",
  messagingSenderId: "609503536209",
  appId: "1:609503536209:web:2c7c279b0d86b5c1374470",
  measurementId: "G-01671BN7TH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
