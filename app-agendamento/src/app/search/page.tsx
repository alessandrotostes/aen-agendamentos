"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ClientRoute } from "../../components/auth/ProtectedRoute";
import EstablishmentSearchView from "../../components/client/EstablishmentSearchView"; // Caminho corrigido
import { useAuth } from "../../contexts/AuthContext";
import SalonIcon from "@/components/SalonIcon";

// Reutilizamos o cabeçalho para consistência
const Header = () => {
  const { currentUser, userData, logout } = useAuth();
  const displayName =
    userData?.firstName || currentUser?.email?.split("@")[0] || "Usuário";
  const displayInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/client" className="flex items-center space-x-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-r from-teal-500 to-indigo-400">
            <SalonIcon className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-800">BeautyApp</span>
        </Link>
        <div className="flex items-center space-x-4">
          <span className="text-gray-700 hidden sm:block">
            Olá, {displayName}!
          </span>
          {currentUser?.photoURL ? (
            <Image
              className="rounded-full"
              src={currentUser.photoURL}
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
            className="px-4 py-2 border rounded-md text-sm font-medium"
          >
            Sair
          </button>
        </div>
      </nav>
    </header>
  );
};

export default function SearchPage() {
  return (
    <ClientRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* O componente de busca não precisa mais da prop onNavigateBack aqui */}
          <EstablishmentSearchView onNavigateBack={() => {}} />
        </main>
      </div>
    </ClientRoute>
  );
}
