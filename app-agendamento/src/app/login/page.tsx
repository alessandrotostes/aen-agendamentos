"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { auth, db } from "@/lib/firebaseConfig";
import SalonIcon from "@/components/SalonIcon";
import AuthLayout from "@/components/AuthLayout";

// Componente do Ícone do Google para manter o JSX principal limpo
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    ></path>
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    ></path>
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().role === "client") {
        router.push("/dashboard");
      } else {
        await signOut(auth);
        setError(
          "Esta é uma conta de estabelecimento. Use o login apropriado."
        );
      }
    } catch (err) {
      console.error("Erro no login com e-mail: ", err);
      if (err instanceof FirebaseError) {
        if (
          err.code === "auth/user-not-found" ||
          err.code === "auth/wrong-password" ||
          err.code === "auth/invalid-credential"
        ) {
          setError("E-mail ou senha inválidos.");
        } else {
          setError("Ocorreu um erro ao fazer login.");
        }
      } else {
        setError("Ocorreu um erro inesperado.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          role: "client",
        });
      }
      router.push("/dashboard");
    } catch (error) {
      setError("Falha ao fazer login com Google.");
      console.error("Erro no login com Google: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-teal-500 to-indigo-400 mb-4">
            <SalonIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Login do Cliente</h1>
          <p className="text-gray-600 mt-2">Acesse sua conta para agendar.</p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 font-semibold text-white bg-gradient-to-r from-teal-500 to-indigo-400 rounded-lg shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Entrar
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-sm">OU</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center bg-white border border-gray-300 rounded-lg shadow-sm px-6 py-3 text-md font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <GoogleIcon /> Entrar com Google
        </button>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="text-center text-sm text-gray-600 space-y-2 pt-4">
          <p>
            Não tem uma conta?{" "}
            <Link
              href="/signup-client"
              className="font-medium text-teal-600 hover:text-teal-500"
            >
              Cadastre-se
            </Link>
          </p>
          <p>
            É um estabelecimento?{" "}
            <Link
              href="/login-owner"
              className="font-medium text-teal-600 hover:text-teal-500"
            >
              Acesse aqui
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
