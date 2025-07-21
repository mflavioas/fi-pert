import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDL_O8h7vTaKYevugCVYwBSGPfjXfr7g34",
  authDomain: "fi-pert-backend.firebaseapp.com",
  projectId: "fi-pert-backend",
  storageBucket: "fi-pert-backend.firebasestorage.app",
  messagingSenderId: "965719971940",
  appId: "1:965719971940:web:17484af2d816bb2dece771"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços que vamos usar
export const db = getFirestore(app);
export const auth = getAuth(app);