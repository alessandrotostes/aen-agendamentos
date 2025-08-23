import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

// --- INÍCIO DO CÓDIGO DE DIAGNÓSTICO ---
console.log("--- DEBUG DE VARIÁVEIS DE AMBIENTE (Vercel) ---");
console.log(
  "API Key (lida do process.env):",
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY
);
console.log(
  "Project ID (lido do process.env):",
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);
// --- FIM DO CÓDIGO DE DIAGNÓSTICO ---

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Log adicional para ver o objeto final
console.log("Objeto firebaseConfig a ser usado:", firebaseConfig);

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, "southamerica-east1");
export const storage = getStorage(app);
export default app;
