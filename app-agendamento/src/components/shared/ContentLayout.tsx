"use client";

import React from "react";

interface ContentLayoutProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function ContentLayout({
  children,
  footer,
}: ContentLayoutProps) {
  return (
    // ALTERAÇÃO: Fundo mais moderno com gradiente radial subtil
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/2 w-[150vw] h-[100vh] bg-gradient-to-br from-indigo-100 via-white to-white rounded-full opacity-50" />

      <div className="w-full max-w-md z-10">
        {/* ALTERAÇÃO: Cartão com borda de gradiente e sombra mais suave */}
        <div className="bg-white p-8 rounded-2xl shadow-2xl shadow-slate-200/60 relative">
          {/* Borda de gradiente no topo */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 to-teal-600 rounded-t-2xl" />

          {children}
        </div>

        {footer && (
          <div className="mt-8 text-center text-sm text-slate-500">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
