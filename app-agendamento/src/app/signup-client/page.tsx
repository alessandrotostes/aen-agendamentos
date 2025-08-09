"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { auth, db } from "@/lib/firebaseConfig";
import SalonIcon from "@/components/SalonIcon";
import AuthLayout from "@/components/AuthLayout";

export default function SignupClientPage() {
  const [name, setName] = useState("");
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

      await updateProfile(user, { displayName: name });

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        displayName: name,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        role: "client",
      });

      router.push("/dashboard");
    } catch (err) {
      console.error("Erro ao cadastrar cliente:", err);
      if (err instanceof FirebaseError) {
        if (err.code === "auth/email-already-in-use") {
          setError("Este e-mail já está em uso.");
        } else if (err.code === "auth/weak-password") {
          setError("A senha deve ter no mínimo 6 caracteres.");
        } else {
          setError("Ocorreu um erro ao criar a conta.");
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
          <h1 className="text-3xl font-bold text-gray-800">Crie sua Conta</h1>
          <p className="text-gray-600 mt-2">
            Rápido e fácil para agendar seus horários.
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <input
              id="name"
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <input
              id="email"
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <input
              id="password"
              type="password"
              placeholder="Crie uma senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {error && <p className="text-sm text-center text-red-500">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 font-semibold text-white bg-gradient-to-r from-teal-500 to-indigo-400 rounded-lg shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? "Criando..." : "Criar Conta"}
            </button>
          </div>
        </form>

        <p className="text-sm text-center text-gray-600">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="font-medium text-teal-600 hover:text-teal-500"
          >
            Faça login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
