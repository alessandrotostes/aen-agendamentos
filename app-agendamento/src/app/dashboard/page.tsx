"use client";

import React, { useState, useEffect } from "react"; // Importar o useEffect
import { useRouter } from "next/navigation"; // Importar o useRouter
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import SalonIcon from "@/components/SalonIcon";
import OwnerView from "@/components/OwnerView";
import ClientView from "@/components/ClientView";
import EstablishmentSearchView from "@/components/EstablishmentSearchView";

export default function DashboardPage() {
  const { user, userProfile, logout, isLoading } = useAuth();
  const router = useRouter(); // Inicializar o router
  const [clientView, setClientView] = useState<"dashboard" | "search">(
    "dashboard"
  );

  // A CORREÇÃO ESTÁ NESTE useEffect
  useEffect(() => {
    // Se o carregamento inicial do contexto terminou e não há um usuário...
    if (!isLoading && !user) {
      // ...redirecionamos para a página inicial.
      router.push("/");
    }
  }, [isLoading, user, router]); // O efeito depende dessas variáveis

  if (isLoading || !user) {
    // Enquanto carrega ou antes do redirect, mostramos uma tela de carregamento para evitar a "tela preta"
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {/* Você pode colocar um spinner aqui se quiser */}
      </div>
    );
  }

  const displayName =
    user.displayName || userProfile?.email?.split("@")[0] || "Usuário";
  const displayInitial = displayName.charAt(0).toUpperCase();

  const renderClientContent = () => {
    if (clientView === "search") {
      return (
        <EstablishmentSearchView
          onNavigateBack={() => setClientView("dashboard")}
        />
      );
    }
    return <ClientView onNavigateToSearch={() => setClientView("search")} />;
  };

  const renderContent = () => {
    if (userProfile?.role === "owner") {
      return <OwnerView user={user} />;
    }
    if (userProfile?.role === "client") {
      return renderClientContent();
    }
    return <div className="text-center">Carregando perfil...</div>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
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
                alt="Foto"
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
              className="px-4 py-2 border rounded-md text-sm font-medium text-teal-700 bg-teal-100 hover:bg-teal-200"
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
