// src/contexts/AuthContext.tsx
"use client";

import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onIdTokenChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth, db, storage } from "../lib/firebaseConfig";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import type { AuthUser } from "../types";

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: AuthUser | null;
  authLoading: boolean; // Estado de loading unificado e mais claro
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (
    email: string,
    password: string,
    name: string,
    role: "owner" | "client",
    imageFile?: File | null
  ) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true); // Começa como true
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        // Se há um usuário no Auth, buscamos seus dados no Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          // Se encontramos os dados, atualizamos ambos os estados
          const data = userSnap.data() as AuthUser;
          setUserData(data);
          setCurrentUser(user);
        } else {
          // Caso raro: usuário existe no Auth mas não no DB. Limpamos tudo.
          console.error(
            "Usuário autenticado não encontrado no Firestore. Fazendo logout."
          );
          await signOut(auth);
          setUserData(null);
          setCurrentUser(null);
        }
      } else {
        // Se não há usuário no Auth, limpamos tudo
        setUserData(null);
        setCurrentUser(null);
      }
      // O loading só termina DEPOIS de todo o processo estar concluído.
      setAuthLoading(false);
    });

    // Limpa o "ouvinte" quando o componente é desmontado
    return () => unsubscribe();
  }, []);

  async function register(
    email: string,
    password: string,
    name: string,
    role: "owner" | "client",
    imageFile?: File | null
  ): Promise<AuthUser> {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const uid = userCredential.user.uid;
    const createdAt = serverTimestamp();

    const newUser: Omit<AuthUser, "createdAt"> = { uid, name, email, role };

    await setDoc(doc(db, "users", uid), { ...newUser, createdAt });

    if (role === "owner") {
      let imageURL = "";
      if (imageFile) {
        const imageRef = ref(
          storage,
          `establishments/${uid}/${imageFile.name}`
        );
        await uploadBytes(imageRef, imageFile);
        imageURL = await getDownloadURL(imageRef);
      }
      await setDoc(doc(db, "establishments", uid), {
        ownerId: uid,
        name,
        email,
        address: "",
        imageURL,
        rating: 0,
        createdAt,
      });
    }

    // Retornamos os dados do novo usuário para a página de registro poder agir
    return { ...newUser, createdAt: new Date() }; // Retorna um objeto AuthUser completo
  }

  async function login(email: string, password: string): Promise<AuthUser> {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      await signOut(auth);
      throw new Error("Dados do usuário não encontrados.");
    }

    const data = userSnap.data() as AuthUser;
    return data;
  }

  async function logout() {
    await signOut(auth);
    setUserData(null);
    setCurrentUser(null);
    router.push("/login");
  }

  async function refreshUserData() {
    if (currentUser) {
      // Força a atualização do token e re-aciona o onIdTokenChanged
      await currentUser.getIdToken(true);
    }
  }

  const value = {
    currentUser,
    userData,
    authLoading,
    login,
    register,
    logout,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
