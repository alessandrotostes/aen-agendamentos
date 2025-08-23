// src/app/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import "./globals.css";

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Imagem de fundo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/fundo-auth1.jpg')",
        }}
      />

      {/* Sobreposição semitransparente */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Conteúdo principal */}
      <div className="relative z-10 max-w-md w-full text-center p-8 bg-white/80 backdrop-blur-md rounded-xl shadow-lg">
        <h1 className="text-4xl font-extrabold text-teal-600 mb-4">A&N</h1>
        <p className="text-lg text-gray-800 mb-8 font-medium">
          Bem-vindo ao Sistema de Agendamento <strong>A&N!</strong>
        </p>
        <div className="space-y-4">
          <Link
            href="/login?role=client"
            className="flex items-center justify-center py-3 px-6 w-full bg-gradient-to-r from-teal-500 to-indigo-400 text-white text-lg font-medium rounded-lg hover:from-teal-600 hover:to-indigo-500 transition-all"
          >
            <span className="mr-2 text-2xl">👤</span>
            Sou Cliente
          </Link>
          <Link
            href="/login?role=professional"
            className="flex items-center justify-center py-3 px-6 w-full bg-gradient-to-r from-indigo-400 to-teal-500 text-white text-lg font-medium rounded-lg hover:from-indigo-500 hover:to-teal-600 transition-all"
          >
            <span className="mr-2 text-2xl">🫂</span>
            Sou Profissional Colaborador
          </Link>
          <Link
            href="/login?role=owner"
            className="flex items-center justify-center py-3 px-6 w-full bg-gradient-to-r from-indigo-400 to-teal-500 text-white text-lg font-medium rounded-lg hover:from-indigo-500 hover:to-teal-600 transition-all"
          >
            <span className="mr-2 text-2xl">👨‍💼💼</span>
            Sou Estabelecimento
          </Link>
        </div>
        <p className="mt-8 text-xs text-gray-600">
          © {new Date().getFullYear()} A&N Agendamentos. Todos os direitos
          reservados.
        </p>
      </div>
    </div>
  );
}
