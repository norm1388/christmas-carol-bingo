// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDK4NazSjNm94ZGuvpI1atKt6soVyJFFnA",
  authDomain: "christmas-carol-bingo.firebaseapp.com",
  projectId: "christmas-carol-bingo",
  storageBucket: "christmas-carol-bingo.firebasestorage.app",
  messagingSenderId: "535695775032",
  appId: "1:535695775032:web:3182d20a9cbd2e1e2d5dcd",
  measurementId: "G-FQKJ2KEMDZ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
