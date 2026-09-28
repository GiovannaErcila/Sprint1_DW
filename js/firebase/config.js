
// js/firebase/config.js
// Inicialización de Firebase para ByteNova.


import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Reemplazá cada valor por el que te mostró Firebase al registrar la app web.
const firebaseConfig = {
  apiKey: "AIzaSyCnGddUmGPil4XpNnZ-L1lc5hCV8ObEizs",
  authDomain: "bytenova-ce435.firebaseapp.com",
  projectId: "bytenova-ce435",
  storageBucket: "bytenova-ce435.firebasestorage.app",
  messagingSenderId: "836555375389",
  appId: "1:836555375389:web:a43ad90f3d89277c6997f4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
