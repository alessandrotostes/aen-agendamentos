"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
// ALTERAÇÃO 1: Importar os ícones que vamos usar
import { Menu, X, Building2, Users, LogIn, Briefcase } from "lucide-react";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const controlHeader = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }

      const currentScrollY = window.scrollY;

      if (currentScrollY <= 10) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", controlHeader);
    return () => {
      window.removeEventListener("scroll", controlHeader);
    };
  }, [isMenuOpen]);

  // ALTERAÇÃO 2: Adicionar a propriedade 'icon' ao nosso array de links
  const navLinks = [
    { href: "#negocios", label: "Para seu Negócio", icon: Building2 },
    { href: "#clientes", label: "Para Clientes", icon: Users },
    { href: "#profissionais", label: "Para Profissionais", icon: Briefcase },
  ];

  const headerClasses = "fixed md:sticky top-0 z-50 w-full";

  const handleScrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <header
      className={`${headerClasses} bg-white/60 backdrop-blur-lg transition-transform duration-300 ease-in-out transform ${
        isHeaderVisible ? "translate-y-0" : "-translate-y-full"
      } ${
        lastScrollY.current > 10
          ? "border-b border-slate-600/20 shadow-sm"
          : "border-b border-transparent"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          onClick={handleScrollToTop}
          className="inline-flex items-center space-x-3 group cursor-pointer"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-teal-600 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <span className="text-white font-bold text-lg">A&N</span>
          </div>
          <span className="text-xl font-bold text-slate-800">All & None</span>
        </Link>

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

      {/* --- ALTERAÇÕES PRINCIPAIS APLICADAS AQUI --- */}
      <div
        className={`md:hidden absolute top-16 left-0 w-full bg-white/80 backdrop-blur-xl shadow-xl transition-all duration-300 ease-in-out transform rounded-b-2xl border-x border-b border-slate-600/20 ${
          isMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <nav className="flex flex-col gap-2 p-4">
          {navLinks.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              className={`flex items-center gap-4 text-slate-900 font-semibold hover:bg-slate-100/70 rounded-lg text-lg w-full p-3 transition-colors ${
                isMenuOpen ? "animate-fadeInUp" : "opacity-0"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => setIsMenuOpen(false)}
            >
              <link.icon className="w-6 h-6 text-teal-600" />
              <span>{link.label}</span>
            </a>
          ))}

          <div className="w-full h-[1px] bg-slate-600/20 my-2" />

          <Link
            href="/login"
            className={`flex items-center justify-center gap-3 text-center px-5 py-3 bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md ${
              isMenuOpen ? "animate-fadeInUp" : "opacity-0"
            }`}
            style={{ animationDelay: `${navLinks.length * 100}ms` }}
            onClick={() => setIsMenuOpen(false)}
          >
            <LogIn className="w-5 h-5" />
            <span>Acessar / Cadastrar</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};
