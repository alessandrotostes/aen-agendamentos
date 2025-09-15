// src/app/layout.tsx
"use client";

import React, { ReactNode } from "react";
import { Inter } from "next/font/google";
import { AuthProvider } from "../contexts/AuthContext";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// NOTA: Como estamos a usar 'use client' no layout, o metadata deve ser gerado no cliente.
// Para SEO, o ideal seria mover o 'use client' para um componente filho, se possível.
// Mas para a funcionalidade atual, esta estrutura funciona.

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Tags essenciais para responsividade e PWA */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#4338ca" />

        {/* Tags para PWA e experiência "Adicionar à Tela de Início" no iOS */}
        <meta name="application-name" content="A&N Agendamentos" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="A&N" />
        <meta
          name="description"
          content="Sua plataforma de agendamentos para estabelecimentos de beleza e bem-estar."
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Link para o seu manifesto da PWA */}
        <link rel="manifest" href="/manifest.json" />

        {/* Ícone para a Tela de Início do iOS */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

        {/* Você pode adicionar um <title> padrão aqui, se desejar */}
        <title>A&N Agendamentos</title>
      </head>
      <body className={`${inter.className} bg-slate-50`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
