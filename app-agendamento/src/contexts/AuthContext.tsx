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
import { getApp } from "firebase/app";
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

export interface RegisterFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "owner" | "client";
  phone: string;
  cpf?: string;
  cnpj?: string;
  imageFile?: File | null;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: AuthUser | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: RegisterFormData) => Promise<AuthUser>;
  registerWithEmail: (
    email: string,
    password: string,
    additionalData: {
      firstName: string;
      lastName: string;
      phone: string;
      cpf: string;
    }
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

  async function register(data: RegisterFormData): Promise<AuthUser> {
    setAuthLoading(true);
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );
    const user = userCredential.user;
    const uid = user.uid;

    const functions = getFunctions(getApp(), "southamerica-east1");
    const setClaimsFn = httpsCallable(functions, "setInitialUserClaims");
    await setClaimsFn({ role: data.role });

    await user.getIdToken(true);

    const createdAt = serverTimestamp();
    const newUserBase: Omit<AuthUser, "createdAt" | "uid"> = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: data.role,
      phone: data.phone || "",
      termsAccepted: false,
      profileStatus: "complete",
    };

    const newUser = { ...newUserBase };
    if (data.role === "client" && data.cpf) {
      (newUser as AuthUser).cpf = data.cpf;
    }

    await setDoc(doc(db, "users", uid), { ...newUser, uid, createdAt });

    if (data.role === "owner") {
      let imageURL = "";
      if (data.imageFile) {
        const imageRef = ref(
          storage,
          `establishments/${uid}/${data.imageFile.name}`
        );
        await uploadBytes(imageRef, data.imageFile);
        imageURL = await getDownloadURL(imageRef);
      }
      const establishmentName = `${data.firstName} ${data.lastName}`.trim();

      const establishmentData = {
        ownerId: uid,
        name: establishmentName,
        email: data.email,
        phone: data.phone || "",
        address: "",
        imageURL,
        rating: 0,
        createdAt,
        cnpj: data.cnpj || "",
      };

      await setDoc(doc(db, "establishments", uid), establishmentData);
    }

    await refreshUserData();
    const finalUserData = {
      ...newUser,
      uid,
      createdAt: Timestamp.now(),
    } as AuthUser;
    return finalUserData;
  }

  async function login(email: string, password: string): Promise<AuthUser> {
    setAuthLoading(true);
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
    additionalData: {
      firstName: string;
      lastName: string;
      phone: string;
      cpf: string;
    }
  ): Promise<FirebaseUser> {
    setAuthLoading(true);
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
      cpf: additionalData.cpf,
      termsAccepted: false,
      profileStatus: "complete", // Cadastro via e-mail já é completo
      createdAt: serverTimestamp(),
    });
    return user;
  }

  async function signInWithGoogle(): Promise<{
    user: FirebaseUser;
    isNewUser: boolean;
  }> {
    // REMOVIDO: setAuthLoading(true); -> O listener global já trata disto.
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    let isNew = false;
    if (!userDoc.exists()) {
      isNew = true;
      const [firstName, ...lastNameParts] = (user.displayName || "").split(" ");
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        role: "client",
        firstName: firstName || "",
        lastName: lastNameParts.join(" ") || "",
        phone: "",
        cpf: "",
        termsAccepted: false,
        profileStatus: "incomplete",
        createdAt: serverTimestamp(),
      });
    }

    // ADICIONADO: Força a atualização do estado userData em toda a aplicação imediatamente.
    await refreshUserData();

    return { user, isNewUser: isNew };
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
    setAuthLoading(true);
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
