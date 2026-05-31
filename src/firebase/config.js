// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA9nCH9STf8l3CG9CGfuPKrcir-f93sINE",
    authDomain: "nhatrocothai.firebaseapp.com",
    projectId: "nhatrocothai",
    storageBucket: "nhatrocothai.firebasestorage.app",
    messagingSenderId: "1043434083888",
    appId: "1:1043434083888:web:797af4c82b605998587ff5",
    measurementId: "G-H578PL59CF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);