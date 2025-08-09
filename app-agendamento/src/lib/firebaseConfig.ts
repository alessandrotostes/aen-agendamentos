// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// ATENÇÃO: Substitua com as suas próprias chaves do Firebase!
const firebaseConfig = {
  apiKey: "AIzaSyBM-z31G_J6Hy5bIdFPORdwKj0mgJfMWiU",
  authDomain: "webappagendamento-1c932.firebaseapp.com",
  projectId: "webappagendamento-1c932",
  storageBucket: "webappagendamento-1c932.firebasestorage.app",
  messagingSenderId: "1077492370772",
  appId: "1:1077492370772:web:ac92e0a533f5182c1eccc1",
  measurementId: "G-VTXFWJJBLJ",
};

// Initialize Firebase
// Para evitar reinicializar o app no lado do servidor com Next.js,
// verificamos se ele já foi inicializado.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Exportando os serviços do Firebase para serem usados em outras partes do app
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
