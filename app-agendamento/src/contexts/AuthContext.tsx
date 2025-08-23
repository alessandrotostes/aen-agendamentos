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
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import type { AuthUser } from "../types";

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    role: "owner" | "client",
    imageFile?: File | null
  ) => Promise<void>;
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
      try {
        setCurrentUser(user);
        if (user) {
          const tokenResult = await user.getIdTokenResult(true);
          console.log("Token Claims:", tokenResult.claims);

          const userDocRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const data = userSnap.data() as DocumentData;
            const finalRole =
              (tokenResult.claims.role as
                | "owner"
                | "client"
                | "professional") || data.role;

            const fetchedUser: AuthUser = {
              uid: user.uid,
              name: data.name,
              email: data.email,
              role: finalRole,
              createdAt: data.createdAt?.toDate() ?? null,
            };
            setUserData(fetchedUser);
          } else {
            console.warn(
              `Utilizador autenticado (uid: ${user.uid}) mas sem documento no Firestore.`
            );
            setUserData(null);
          }
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error("Erro durante a verificação de autenticação:", error);
        setCurrentUser(null);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  async function register(
    email: string,
    password: string,
    name: string,
    role: "owner" | "client",
    imageFile?: File | null
  ) {
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
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // --- FUNÇÃO login CORRIGIDA ---
  async function login(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Sucesso! O onIdTokenChanged vai tratar do resto.
    } catch (error) {
      console.error("Falha no login (dentro do AuthContext):", error);
      // IMPORTANTE: Relançamos o erro para que a página de login o possa apanhar.
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
