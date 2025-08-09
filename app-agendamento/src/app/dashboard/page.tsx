"use client";

import React, { useEffect } from "react"; // 1. useEffect já está aqui, vamos usá-lo
import { useRouter } from "next/navigation"; // 2. Precisamos do useRouter
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import SalonIcon from "@/components/SalonIcon";
import OwnerView from "@/components/OwnerView";
import ClientView from "@/components/ClientView";

export default function DashboardPage() {
  const { user, userProfile, logout, isLoading } = useAuth();
  const router = useRouter(); // 3. Inicializamos o router

  // 4. Este useEffect agora cuidará do redirecionamento
  useEffect(() => {
    // Se o carregamento do contexto terminou e não há um usuário logado...
    if (!isLoading && !user) {
      // ...redirecionamos para a página de login.
      router.push("/login");
    }
  }, [isLoading, user, router]); // O efeito depende dessas variáveis

  // Enquanto o contexto carrega ou se não houver usuário (antes do redirect),
  // mostramos uma tela de carregamento/vazia para evitar "flashes" de conteúdo.
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {/* Você pode colocar um spinner aqui se quiser */}
      </div>
    );
  }

  // Se chegamos aqui, o usuário está logado e os dados estão carregados.
  const displayName =
    user.displayName || userProfile?.email?.split("@")[0] || "Usuário";
  const displayInitial = displayName.charAt(0).toUpperCase();

  const renderContent = () => {
    if (userProfile?.role === "owner") {
      return <OwnerView user={user} />;
    }
    if (userProfile?.role === "client") {
      return <ClientView />;
    }
    return <div className="text-center">Verificando perfil...</div>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-r from-teal-500 to-indigo-400">
              <SalonIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">Meu Painel</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 hidden sm:block">
              Olá, {displayName}!
            </span>
            {user.photoURL ? (
              <Image
                className="rounded-full"
                src={user.photoURL}
                alt="Foto do usuário"
                width={40}
                height={40}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-teal-200 flex items-center justify-center text-teal-700 font-bold">
                {displayInitial}
              </div>
            )}
            <button
              onClick={logout}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-teal-700 bg-teal-100 hover:bg-teal-200"
            >
              Sair
            </button>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
}
