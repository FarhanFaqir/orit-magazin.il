// ── FIREBASE CONFIGURATION ──
// Real project config (from console.firebase.google.com — israel-magazine project)

const firebaseConfig = {
  apiKey: "AIzaSyBKVNV73rzj9aPD_9_jE5gi63eIQY3WEAs",
  authDomain: "israel-magazine.firebaseapp.com",
  projectId: "israel-magazine",
  storageBucket: "israel-magazine.firebasestorage.app",
  messagingSenderId: "195276364802",
  appId: "1:195276364802:web:c7c3113b4a09b4ee17db1b",
  measurementId: "G-F5L8SJKDJT",
  databaseURL: "https://israel-magazine-default-rtdb.europe-west1.firebasedatabase.app"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ── DATABASE STRUCTURE ──
// /articles - all articles
// /settings - site settings (title, description, etc)
// /code - HTML/CSS/JS code for pages

console.log('✅ Firebase connected');
