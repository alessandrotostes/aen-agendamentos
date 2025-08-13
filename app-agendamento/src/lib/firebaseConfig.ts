import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

// Substitua pelas suas credenciais Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBM-z31G_J6Hy5bIdFPORdwKj0mgJfMWiU",
  authDomain: "webappagendamento-1c932.firebaseapp.com",
  projectId: "webappagendamento-1c932",
  storageBucket: "webappagendamento-1c932.firebasestorage.app",
  messagingSenderId: "1077492370772",
  appId: "1:1077492370772:web:ac92e0a533f5182c1eccc1",
  measurementId: "G-VTXFWJJBLJ",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Serviços Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, "southamerica-east1");
export const storage = getStorage(app);

export default app;
