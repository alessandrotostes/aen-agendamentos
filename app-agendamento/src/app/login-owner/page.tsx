"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { auth, db } from "@/lib/firebaseConfig";
import SalonIcon from "@/components/SalonIcon";
import AuthLayout from "@/components/AuthLayout"; // Importando o layout

export default function LoginOwnerPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleOwnerLogin = async (e: React.FormEvent) => {
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

      if (userDoc.exists() && userDoc.data().role === "owner") {
        router.push("/dashboard");
      } else {
        await signOut(auth);
        setError("Esta conta não pertence a um estabelecimento.");
      }
    } catch (err) {
      console.error("Erro no login do proprietário: ", err);
      if (err instanceof FirebaseError) {
        if (
          err.code === "auth/user-not-found" ||
          err.code === "auth/wrong-password" ||
          err.code === "auth/invalid-credential"
        ) {
          setError("Credenciais de proprietário inválidas.");
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

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-teal-500 to-indigo-400 mb-4">
            <SalonIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            Login do Estabelecimento
          </h1>
          <p className="text-gray-600 mt-2">
            Acesse para gerenciar seu negócio.
          </p>
        </div>

        <form onSubmit={handleOwnerLogin} className="space-y-4">
          <input
            type="email"
            placeholder="E-mail do proprietário"
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

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="text-center text-sm text-gray-600 space-y-2 pt-4">
          <p>
            Não tem uma conta?{" "}
            <Link
              href="/cadastro"
              className="font-medium text-teal-600 hover:text-teal-500"
            >
              Cadastre seu estabelecimento
            </Link>
          </p>
          <p>
            Não é um estabelecimento?{" "}
            <Link
              href="/login"
              className="font-medium text-teal-600 hover:text-teal-500"
            >
              Voltar para login de cliente
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
