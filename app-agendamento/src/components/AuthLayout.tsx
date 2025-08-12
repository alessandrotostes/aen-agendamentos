import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    // Este é o container principal que usa flexbox para centralizar
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-black p-4">
      {/* Imagem de Fundo */}
      <div className="absolute inset-0 bg-[url('/images/fundo-auth.jpg')] bg-cover bg-center opacity-70"></div>

      {/* Este é o único filho direto do container flex. Ele centraliza o conteúdo. */}
      <div className="relative z-10 w-full max-w-md">
        {/* O {children} (nosso formulário) deve estar AQUI DENTRO deste div */}
        {children}
      </div>
    </div>
  );
}
