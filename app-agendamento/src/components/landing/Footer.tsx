"use client";

import Link from "next/link";

export const Footer = () => {
  // Função para scroll suave ao topo, igual à do Header para consistência
  const handleScrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 pt-8 pb-6">
        {/* --- SEÇÃO PRINCIPAL: Logo à esquerda, Links à direita --- */}
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          {/* Logo/Nome da Marca (consistente com o Header) */}
          <a
            href="/"
            onClick={handleScrollToTop}
            className="inline-flex items-center space-x-3 group cursor-pointer"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-teal-600 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <span className="text-white font-bold text-lg">A&N</span>
            </div>
            <span className="text-xl font-bold text-white">All & None</span>
          </a>

          {/* Links Legais */}
          <div className="flex items-center space-x-6">
            <Link
              href="/termos-de-uso"
              className="text-sm text-slate-400 hover:text-white hover:underline transition-colors"
            >
              Termos de Uso
            </Link>
            <Link
              href="/politica-de-privacidade"
              className="text-sm text-slate-400 hover:text-white hover:underline transition-colors"
            >
              Política de Privacidade
            </Link>
          </div>
        </div>

        {/* --- LINHA SEPARADORA --- */}
        <hr className="my-8 border-slate-700" />

        {/* --- SEÇÃO DE COPYRIGHT --- */}
        <div className="text-center">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} TS Desenvolvimentos. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
