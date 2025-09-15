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
  GoogleAuthProvider,
  signInWithPopup,
  type User as FirebaseUser,
} from "firebase/auth";
import { getApp } from "firebase/app"; // Importação que faltava
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth, db, storage } from "../lib/firebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import type { AuthUser } from "../types";

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
    phone?: string
  ) => Promise<AuthUser>;
  registerWithEmail: (
    email: string,
    password: string,
    additionalData: { firstName: string; lastName: string; phone: string }
  ) => Promise<FirebaseUser>;
  signInWithGoogle: () => Promise<{ user: FirebaseUser; isNewUser: boolean }>;
  updatePhoneNumber: (uid: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<AuthUser | null>;
  updateUserProfile: (uid: string, data: Partial<AuthUser>) => Promise<void>;
  acceptTerms: (uid: string) => Promise<void>;
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
        // Força a atualização do token para obter os custom claims mais recentes
        await user.getIdToken(true);
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data() as AuthUser;
          setUserData(data);
          setCurrentUser(user);
        } else {
          console.warn(
            "Documento do usuário não encontrado no Firestore. Pode ser um novo registro."
          );
        }
      } else {
        setUserData(null);
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: "owner" | "client",
    imageFile?: File | null,
    phone?: string
  ): Promise<AuthUser> {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    const uid = user.uid;

    const functions = getFunctions(getApp(), "southamerica-east1");
    const setClaimsFn = httpsCallable(functions, "setInitialUserClaims");
    await setClaimsFn({ role: role });

    await user.getIdToken(true);

    const createdAt = serverTimestamp();
    const newUser: Omit<AuthUser, "createdAt"> = {
      uid,
      firstName,
      lastName,
      email,
      role,
      phone: phone || "",
      termsAccepted: false,
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
      await setDoc(doc(db, "establishments", uid), {
        ownerId: uid,
        name: establishmentName,
        email,
        phone: phone || "",
        address: "",
        imageURL,
        rating: 0,
        createdAt,
      });
    }

    await refreshUserData();
    return { ...newUser, createdAt: Timestamp.now() };
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

  async function registerWithEmail(
    email: string,
    password: string,
    additionalData: { firstName: string; lastName: string; phone: string }
  ): Promise<FirebaseUser> {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      role: "client",
      firstName: additionalData.firstName,
      lastName: additionalData.lastName,
      phone: additionalData.phone,
      termsAccepted: false,
      createdAt: serverTimestamp(),
    });
    return user;
  }

  async function signInWithGoogle(): Promise<{
    user: FirebaseUser;
    isNewUser: boolean;
  }> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      const [firstName, ...lastNameParts] = (user.displayName || "").split(" ");
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        role: "client",
        firstName: firstName || "",
        lastName: lastNameParts.join(" ") || "",
        phone: "",
        termsAccepted: false,
        createdAt: serverTimestamp(),
      });
      return { user, isNewUser: true };
    }
    return { user, isNewUser: false };
  }

  async function updatePhoneNumber(uid: string, phone: string): Promise<void> {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, { phone: phone });
  }

  async function updateUserProfile(
    uid: string,
    data: Partial<AuthUser>
  ): Promise<void> {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, data);
  }

  async function acceptTerms(uid: string): Promise<void> {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, {
      termsAccepted: true,
      termsAcceptedAt: serverTimestamp(),
    });
  }

  async function logout() {
    await signOut(auth);
    router.push("/login");
  }

  async function refreshUserData(): Promise<AuthUser | null> {
    const user = auth.currentUser;
    if (user) {
      await user.getIdToken(true);
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const freshData = userSnap.data() as AuthUser;
        setUserData(freshData);
        return freshData;
      }
    }
    setUserData(null);
    return null;
  }

  const value = {
    currentUser,
    userData,
    authLoading,
    login,
    register,
    logout,
    refreshUserData,
    registerWithEmail,
    signInWithGoogle,
    updatePhoneNumber,
    updateUserProfile,
    acceptTerms,
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
