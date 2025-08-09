"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { auth, db } from "@/lib/firebaseConfig";
import SalonIcon from "@/components/SalonIcon";
import AuthLayout from "@/components/AuthLayout"; // Importando o layout

export default function CadastroPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        createdAt: serverTimestamp(),
        role: "owner",
      });

      router.push("/");
    } catch (err) {
      console.error("Erro ao cadastrar:", err);
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/email-already-in-use":
            setError("Este e-mail já está em uso.");
            break;
          case "auth/weak-password":
            setError("A senha deve ter no mínimo 6 caracteres.");
            break;
          default:
            setError("Ocorreu um erro ao criar a conta.");
            break;
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
      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 text-center">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-teal-500 to-indigo-400">
          <SalonIcon className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Crie sua Conta</h1>
          <p className="text-gray-600 mt-2">
            Para gerenciar seu estabelecimento.
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <input
              id="email"
              type="email"
              placeholder="Seu melhor e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 mt-1 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <input
              id="password"
              type="password"
              placeholder="Crie uma senha forte"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 mt-1 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 font-semibold text-white bg-gradient-to-r from-teal-500 to-indigo-400 rounded-lg shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? "Criando conta..." : "Cadastrar"}
            </button>
          </div>
        </form>

        <p className="text-sm text-gray-600">
          É um cliente?{" "}
          <Link
            href="/login"
            className="font-medium text-teal-600 hover:text-teal-500"
          >
            Faça login aqui
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
