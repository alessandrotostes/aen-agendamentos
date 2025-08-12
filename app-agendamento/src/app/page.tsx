"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // Esta lógica de redirecionamento está correta e permanece a mesma
  useEffect(() => {
    if (!isAuthLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isAuthLoading, router]);

  // LÓGICA DE RENDERIZAÇÃO CORRIGIDA ABAIXO

  // 1. Enquanto a autenticação está sendo verificada, mostramos um loader
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {/* Pode adicionar um spinner aqui */}
      </div>
    );
  }

  // 2. Se a verificação terminou e TEM um usuário, o useEffect acima vai redirecionar.
  //    Mostramos uma mensagem enquanto isso acontece.
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Redirecionando para o seu painel...</p>
      </div>
    );
  }

  // 3. Se a verificação terminou e NÃO TEM usuário, mostramos a Landing Page
  return (
    <div className="w-full">
      <section className="relative flex items-center justify-center h-screen bg-black">
        <div className="absolute inset-0 bg-[url('/images/fundo-auth.jpg')] bg-cover bg-center opacity-70"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900">
            <span className="bg-gradient-to-r from-teal-500 to-indigo-400 bg-clip-text text-transparent">
              Agende. Relaxe.
            </span>{" "}
            <span className="bg-gradient-to-r from-teal-500 to-indigo-400 bg-clip-text text-transparent">
              Transforme.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-200">
            A forma mais simples de encontrar e agendar horários nos melhores
            salões e barbearias da sua cidade.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-block px-8 py-4 bg-gradient-to-r from-teal-500 to-indigo-400 text-white font-bold text-lg rounded-lg shadow-lg hover:opacity-90 transition-transform transform hover:scale-105"
            >
              Quero Agendar Agora
            </Link>
            <Link
              href="/login-owner"
              className="w-full sm:w-auto inline-block px-8 py-4 bg-gray-700 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
            >
              Sou um Estabelecimento
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
