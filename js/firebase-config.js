// ── FIREBASE CONFIGURATION ──
// Replace with YOUR Firebase config from https://console.firebase.google.com/

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "israel-magazine.firebaseapp.com",
  projectId: "israel-magazine",
  storageBucket: "israel-magazine.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  databaseURL: "https://israel-magazine-default-rtdb.europe-west1.firebasedatabase.app",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ── DATABASE STRUCTURE ──
// /articles - all articles
// /settings - site settings (title, description, etc)
// /code - HTML/CSS/JS code for pages

console.log('✅ Firebase connected');
