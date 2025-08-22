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

// ===== INTERFACE ATUALIZADA =====
interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  // A função register agora também retorna Promise<AuthUser>
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
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data() as AuthUser;
          setUserData(data);
          setCurrentUser(user);
        } else {
          await signOut(auth);
          setUserData(null);
          setCurrentUser(null);
        }
      } else {
        setUserData(null);
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // ===== FUNÇÃO REGISTER ATUALIZADA =====
  async function register(
    email: string,
    password: string,
    name: string,
    role: "owner" | "client",
    imageFile?: File | null
  ): Promise<AuthUser> {
    setLoading(true);
    try {
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

      // Retornamos os dados do novo utilizador para a página de registo poder agir
      return { ...newUser, createdAt: new Date() };
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }

  async function login(email: string, password: string): Promise<AuthUser> {
    try {
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
        throw new Error("Dados do utilizador não encontrados.");
      }

      const data = userSnap.data() as AuthUser;
      return data;
    } catch (error) {
      console.error("Falha no login:", error);
      throw error;
    }
  }

  async function logout() {
    await signOut(auth);
    router.push("/login");
  }

  async function refreshUserData() {
    if (currentUser) {
      await currentUser.getIdToken(true);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userData,
        loading,
        login,
        register,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
