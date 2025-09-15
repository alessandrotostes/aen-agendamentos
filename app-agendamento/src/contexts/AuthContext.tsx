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
import { auth, db, storage } from "../lib/firebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import type { AuthUser } from "../types";

// ALTERAÇÃO 3: Atualizar a "planta" do nosso Contexto com as novas funções
interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: AuthUser | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (
    // Esta é a sua função original, mantida para os "owners"
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: "owner" | "client",
    imageFile?: File | null,
    phone?: string
  ) => Promise<AuthUser>;
  // Novas funções adicionadas para o fluxo do modal
  registerWithEmail: (
    email: string,
    password: string,
    additionalData: { firstName: string; lastName: string; phone: string }
  ) => Promise<FirebaseUser>;
  signInWithGoogle: () => Promise<{ user: FirebaseUser; isNewUser: boolean }>;
  updatePhoneNumber: (uid: string, phone: string) => Promise<void>;
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
          // Se o documento não existe (ex: acabou de se registar com Google),
          // o `signInWithGoogle` já criou o documento base.
          // O `onAuthStateChanged` vai re-rodar e encontrar.
          // Se mesmo assim não encontrar, é um erro real.
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

  // Sua função register original - Nenhuma alteração aqui
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
    const uid = userCredential.user.uid;
    const createdAt = serverTimestamp();

    const newUser: Omit<AuthUser, "createdAt"> = {
      uid,
      firstName,
      lastName,
      email,
      role,
      phone: phone || "",
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

    await userCredential.user.getIdToken(true);
    return { ...newUser, createdAt: new Date() };
  }

  // Sua função login original - Nenhuma alteração aqui
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

  // ALTERAÇÃO 4: Adicionar as novas funções para o fluxo de registo do cliente

  /**
   * Função para registo simplificado de clientes via email e senha.
   */
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
      createdAt: serverTimestamp(),
    });

    return user;
  }

  /**
   * Função para login e registo com a conta Google.
   */
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
      // É um novo utilizador, cria um documento base no Firestore
      const [firstName, ...lastNameParts] = (user.displayName || "").split(" ");
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        role: "client",
        firstName: firstName || "",
        lastName: lastNameParts.join(" ") || "",
        phone: "", // Telefone fica em branco para ser pedido depois
        createdAt: serverTimestamp(),
      });
      return { user, isNewUser: true };
    }

    // Utilizador já existente
    return { user, isNewUser: false };
  }

  /**
   * Função para atualizar o número de telefone de um utilizador.
   */
  async function updatePhoneNumber(uid: string, phone: string): Promise<void> {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, {
      phone: phone,
    });
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

  // ALTERAÇÃO 5: Expor as novas funções no `value` do Contexto
  const value = {
    currentUser,
    userData,
    authLoading,
    login,
    register, // Sua função original
    logout,
    refreshUserData,
    // Novas funções
    registerWithEmail,
    signInWithGoogle,
    updatePhoneNumber,
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
