// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDpgytqeXPH-6ec1IIIs84UuDhNISO7bUc",
  authDomain: "cleaning-tracker-2025.firebaseapp.com",
  projectId: "cleaning-tracker-2025",
  storageBucket: "cleaning-tracker-2025.firebasestorage.app",
  messagingSenderId: "1031453638079",
  appId: "1:1031453638079:web:fcbcd62e827fb3f2db350a",
  measurementId: "G-HZH8C1S3C7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);