import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Конфигурация вашего проекта Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDaQsnu878DXOu6LP_GCpF0xHJ2EjQr9So",
  authDomain: "skladpro-db72f.firebaseapp.com",
  projectId: "skladpro-db72f",
  storageBucket: "skladpro-db72f.firebasestorage.app",
  messagingSenderId: "700481762679",
  appId: "1:700481762679:web:4dd6dd73ee5e0adba15d72"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
