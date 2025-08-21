"use client";

import React from "react";

interface ContentLayoutProps {
  children: React.ReactNode;
  footer?: React.ReactNode; // Prop opcional para o rodapé
}

export default function ContentLayout({
  children,
  footer,
}: ContentLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* O conteúdo principal da página (como o formulário) entra aqui */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          {children}
        </div>

        {/* Se um rodapé for fornecido, ele será renderizado aqui em baixo */}
        {footer && <div className="mt-6 text-center">{footer}</div>}
      </div>
    </div>
  );
}
