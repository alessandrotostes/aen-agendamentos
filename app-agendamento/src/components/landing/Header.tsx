"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // ALTERAÇÃO: Estado para controlar o fundo do header com o scroll
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#clientes", label: "Para Clientes" },
    { href: "#negocios", label: "Para seu Negócio" },
    { href: "#profissionais", label: "Para Profissionais" },
  ];

  // ALTERAÇÃO: Classes dinâmicas baseadas no estado 'hasScrolled'
  const headerClasses = `sticky top-0 z-50 w-full transition-all duration-300 ${
    hasScrolled
      ? "border-b bg-white/80 backdrop-blur-md shadow-sm"
      : "border-b border-transparent"
  }`;

  return (
    <header className={headerClasses}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* ALTERAÇÃO: Logo consistente com o AuthLayout */}
        <Link href="/" className="inline-flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-teal-600 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <span className="text-white font-bold text-lg">A&N</span>
          </div>
          <span className="text-xl font-bold text-slate-800">All & None</span>
        </Link>

        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-700">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-teal-500 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            {/* ALTERAÇÃO: Botão com o gradiente padrão da aplicação */}
            <Link
              href="/login"
              className="px-5 py-2 bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              Acessar
            </Link>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 hover:text-indigo-600"
              aria-label="Abrir menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white shadow-lg">
          <nav className="flex flex-col items-center gap-4 p-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-indigo-600 text-lg w-full text-center py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              className="mt-4 w-full text-center px-5 py-3 bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md"
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
