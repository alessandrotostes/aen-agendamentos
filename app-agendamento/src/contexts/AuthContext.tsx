"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
// 1. Importar o onSnapshot
import { doc, getDoc, onSnapshot, DocumentData } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";

export interface UserProfile extends DocumentData {
  uid: string;
  email: string;
  role: "client" | "owner";
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged continua sendo nosso gatilho principal
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // 2. Usamos onSnapshot em vez de getDoc
        const userDocRef = doc(db, "users", currentUser.uid);

        // onSnapshot retorna sua própria função de 'unsubscribe'
        const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            setUserProfile(null);
          }
          setIsLoading(false);
        });

        // 3. Retornamos a função para limpar o ouvinte do perfil quando o usuário deslogar
        return () => unsubscribeProfile();
      } else {
        setUserProfile(null);
        setIsLoading(false);
      }
    });

    // Retorna a função para limpar o ouvinte de autenticação
    return () => unsubscribeAuth();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    userProfile,
    isLoading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
