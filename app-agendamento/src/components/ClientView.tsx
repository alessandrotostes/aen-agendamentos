"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

// Ícone de Calendário para usar no card
const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

export default function ClientView() {
  const { userProfile } = useAuth();
  const displayName = userProfile?.displayName?.split(" ")[0] || "Cliente";

  return (
    <div className="space-y-8">
      {/* Card de Boas-Vindas e Ação Principal */}
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Olá, <span className="text-teal-600">{displayName}</span>!
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Pronto para sua próxima experiência de bem-estar?
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-gradient-to-r from-teal-500 to-indigo-400 text-white font-bold text-lg rounded-lg shadow-lg hover:opacity-90 transition-transform transform hover:scale-105"
          >
            Procurar Estabelecimentos
          </Link>
        </div>
      </div>

      {/* Card de Próximos Agendamentos (Placeholder para o futuro) */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Meus Próximos Agendamentos
        </h2>
        <div className="flex flex-col items-center text-center text-gray-500 py-8">
          <CalendarIcon />
          <p className="mt-4 font-semibold">
            Você ainda não tem agendamentos futuros.
          </p>
          <p className="mt-1 text-sm">
            Seus novos agendamentos aparecerão aqui.
          </p>
        </div>
      </div>
    </div>
  );
}
