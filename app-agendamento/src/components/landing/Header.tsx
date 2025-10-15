"use client";

import React, { useState, useEffect } from "react";
// O 'Link' do Next.js ainda é usado para os botões de Acessar, então o mantemos.
import Link from "next/link";
import { Menu, X } from "lucide-react";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#negocios", label: "Para seu Negócio" },
    { href: "#clientes", label: "Para Clientes" },
    { href: "#profissionais", label: "Para Profissionais" },
  ];

  const headerClasses = `sticky top-0 z-50 w-full transition-all duration-300 ${
    hasScrolled
      ? "bg-white/60 backdrop-blur-lg shadow-sm"
      : "border-transparent"
  }`;

  // ALTERAÇÃO 1: Criar a função para o scroll suave
  const handleScrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Previne o comportamento padrão do link de recarregar a página
    e.preventDefault();
    // Executa a animação de scroll para o topo
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <header className={headerClasses}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* ALTERAÇÃO 2: Substituir <Link> por <a> e adicionar o onClick */}
        <a
          href="/"
          onClick={handleScrollToTop}
          className="inline-flex items-center space-x-3 group cursor-pointer"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-teal-600 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <span className="text-white font-bold text-lg">A&N</span>
          </div>
          <span className="text-xl font-bold text-slate-800">All & None</span>
        </a>

        <nav className="hidden md:flex gap-8 text-sm font-semibold tracking-wide text-gray-700">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative group pb-1 transition-colors duration-300 hover:text-teal-600"
            >
              <span>{link.label}</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-500 transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <Link
              href="/login"
              className="px-5 py-2 bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
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

      <div
        className={`md:hidden absolute top-16 left-0 w-full bg-white shadow-lg transition-all duration-300 ease-in-out transform ${
          isMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
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
    </header>
  );
};
