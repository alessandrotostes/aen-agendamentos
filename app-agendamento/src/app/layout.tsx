// src/app/layout.tsx
"use client";

import React, { ReactNode } from "react";
import { Inter } from "next/font/google";
import { AuthProvider } from "../contexts/AuthContext";
import CookieConsent from "react-cookie-consent";
import Link from "next/link";

// Alteração 1: Importar o SEU componente de rodapé do caminho correto
import { Footer } from "@/components/landing/Footer";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // Alteração 2: Adicionar a classe h-full para o flexbox funcionar corretamente
    <html lang="pt-BR" className="h-full">
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

        <title>A&N Agendamentos</title>
      </head>
      {/* Alteração 3: Usar flexbox para empurrar o rodapé para baixo */}
      <body
        className={`${inter.className} bg-slate-50 flex flex-col min-h-screen`}
      >
        <AuthProvider>
          {/* A tag <main> ocupa o espaço disponível */}
          <main className="flex-grow">{children}</main>

          {/* Alteração 4: Adicionar o SEU componente Footer aqui */}
          <Footer />

          {/* O CookieConsent pode ficar logo após o footer */}
          <CookieConsent
            location="bottom"
            buttonText="Eu aceito"
            cookieName="aenAgendamentosCookieConsent"
            style={{
              background: "linear-gradient(to right, #1f2937, #111827)",
              color: "#f3f4f6",
              fontSize: "14px",
              boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
              zIndex: 9999,
            }}
            buttonStyle={{
              background: "#14b8a6",
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
              borderRadius: "8px",
              padding: "10px 15px",
            }}
            expires={150}
            declineButtonText="Eu recuso"
            enableDeclineButton
            declineButtonStyle={{
              background: "#4b5563",
              color: "#f3f4f6",
              fontSize: "14px",
              borderRadius: "8px",
              padding: "10px 15px",
            }}
          >
            Nós utilizamos cookies para melhorar a sua experiência no nosso
            site. Ao continuar a navegar, você concorda com a nossa{" "}
            <Link
              href="/politica-de-privacidade"
              className="font-bold text-teal-400 hover:underline"
            >
              Política de Privacidade
            </Link>
            .
          </CookieConsent>
        </AuthProvider>
      </body>
    </html>
  );
}
