"use client"; // Adicionado para usar o Link

import Link from "next/link"; // Adicionado para os links

export const Footer = () => (
  <footer className="bg-slate-900 text-white py-12">
    <div className="container mx-auto px-4 text-center">
      <p className="font-bold text-lg text-white">A&N Agendamentos</p>

      {/* SEÇÃO ADICIONADA: LINKS LEGAIS */}
      <div className="flex justify-center space-x-6 my-4">
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
      {/* FIM DA SEÇÃO ADICIONADA */}

      <p className="mt-2 text-xs text-slate-500">
        © {new Date().getFullYear()} TS Desenvolvimentos. Todos os direitos
        reservados.
      </p>
    </div>
  </footer>
);
