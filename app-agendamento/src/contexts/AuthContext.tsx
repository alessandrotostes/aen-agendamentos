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

// ===== ALTERAÇÃO 1: ATUALIZAR A "PLANTA" DA FUNÇÃO REGISTER =====
interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: AuthUser | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: "owner" | "client",
    imageFile?: File | null,
    phone?: string // Adicionado telemóvel
  ) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const data = userSnap.data() as AuthUser;
          setUserData(data);
          setCurrentUser(user);
        } else {
          console.error(
            "Usuário autenticado não encontrado no Firestore. Fazendo logout."
          );
          await signOut(auth);
          setUserData(null);
          setCurrentUser(null);
        }
      } else {
        setUserData(null);
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // MUDANÇA 2: A implementação da função register foi atualizada.
  async function register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: "owner" | "client",
    imageFile?: File | null,
    phone?: string // Recebe o telemóvel
  ): Promise<AuthUser> {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const uid = userCredential.user.uid;
    const createdAt = serverTimestamp();

    const newUser: Omit<AuthUser, "createdAt"> = {
      uid,
      firstName,
      lastName,
      email,
      role,
      phone: phone || "", // Salva o telemóvel no perfil do utilizador
    };

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

      const establishmentName = `${firstName} ${lastName}`.trim();

      // Salva também o telemóvel no perfil do estabelecimento
      await setDoc(doc(db, "establishments", uid), {
        ownerId: uid,
        name: establishmentName,
        email,
        phone: phone || "", // <-- Adicionado telemóvel ao estabelecimento
        address: "",
        imageURL,
        rating: 0,
        createdAt,
      });
    }

    await userCredential.user.getIdToken(true);
    return { ...newUser, createdAt: new Date() };
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
