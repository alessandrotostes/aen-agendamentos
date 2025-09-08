// src/components/landing/Header.tsx
"use client";

// MUDANÇA 1: Adicionamos useState do React e os ícones do menu
import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react"; // Ícones para o botão

export const Header = () => {
  // MUDANÇA 2: Criamos o estado para controlar se o menu móvel está aberto ou fechado
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "#clientes", label: "Para Clientes" },
    { href: "#negocios", label: "Para seu Negócio" },
    { href: "#profissionais", label: "Para Profissionais" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-2xl font-bold text-teal-600">
          A&N
        </Link>

        {/* MUDANÇA 3: Navegação para Desktop (escondida em telas pequenas) */}
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-700">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-teal-600 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <Link
              href="/login"
              className="px-5 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-sm hover:bg-teal-700 transition"
            >
              Acessar
            </Link>
          </div>

          {/* MUDANÇA 4: Botão "Hambúrguer" (visível apenas em telas pequenas) */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 hover:text-teal-600"
              aria-label="Abrir menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MUDANÇA 5: O painel do menu móvel (que abre e fecha) */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white shadow-lg">
          <nav className="flex flex-col items-center gap-4 p-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-teal-600 text-lg w-full text-center py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              className="mt-4 w-full text-center px-5 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-sm hover:bg-teal-700 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Acessar / Cadastrar
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
