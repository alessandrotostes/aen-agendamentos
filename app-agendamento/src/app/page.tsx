"use client";

import React, { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  query,
  onSnapshot,
  DocumentData,
} from "firebase/firestore";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface Establishment extends DocumentData {
  id: string;
  businessName: string;
  address: string;
  phone: string;
}

// Ícone de "Dashboard" para o novo botão
const DashboardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
    />
  </svg>
);

export default function HomePage() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: isAuthLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      setIsLoading(false);
      return;
    }
    const establishmentsRef = collection(db, "establishments");
    const q = query(establishmentsRef);
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        setEstablishments(
          querySnapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as Establishment)
          )
        );
        setIsLoading(false);
      },
      (error) => {
        console.error("Erro ao buscar estabelecimentos: ", error);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [isAuthLoading, user]);

  const filteredEstablishments = useMemo(() => {
    if (!searchTerm) return establishments;
    return establishments.filter((est) =>
      est.businessName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, establishments]);

  if (isLoading || isAuthLoading) {
    return <div className="text-center text-gray-600 mt-20">Carregando...</div>;
  }

  // Visão para usuário DESLOGADO
  if (!user) {
    return (
      <div className="w-full">
        <section className="relative flex items-center justify-center h-screen bg-white">
          <div className="absolute inset-0 bg-[url('/images/fundo-auth.jpg')] bg-cover bg-center opacity-35"></div>
          <div className="relative z-10 text-center px-4">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900">
              <span className="bg-gradient-to-r from-teal-500 to-indigo-400 bg-clip-text text-transparent">
                Agende. Relaxe.
              </span>{" "}
              <span className="bg-gradient-to-r from-teal-500 to-indigo-400 bg-clip-text text-transparent">
                Transforme.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-700">
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

  // Visão para o usuário LOGADO
  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full flex justify-end mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-500 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <DashboardIcon />
            Meu Painel
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl tracking-tight">
            Encontre seu próximo agendamento
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
            Explore os estabelecimentos disponíveis na sua região.
          </p>
        </div>

        <div className="mb-12 max-w-lg mx-auto">
          <input
            type="text"
            placeholder="Buscar pelo nome do estabelecimento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {filteredEstablishments.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEstablishments.map((est) => (
              <div
                key={est.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {est.businessName}
                  </h2>
                  <p className="mt-2 text-gray-600">{est.address}</p>
                  <p className="mt-2 text-sm text-teal-600 font-semibold">
                    {est.phone}
                  </p>
                  <div className="mt-6">
                    <Link
                      href={`/establishment/${est.id}`}
                      className="w-full text-center block px-4 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 transition-all"
                    >
                      Ver Serviços e Agendar
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-10">
            <p>Nenhum estabelecimento encontrado com o nome {searchTerm}.</p>
          </div>
        )}
      </main>
    </div>
  );
}
