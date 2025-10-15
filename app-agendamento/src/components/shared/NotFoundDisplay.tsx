"use client";

import { SearchX, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface NotFoundDisplayProps {
  title?: string;
  message?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export default function NotFoundDisplay({
  title = "Página Não Encontrada",
  message = "O link que você tentou aceder parece não existir. Verifique se o endereço foi copiado corretamente.",
  buttonText = "Voltar à Página Inicial",
}: NotFoundDisplayProps) {
  const router = useRouter();

  // Se uma função de clique não for fornecida, usamos a padrão
  const handleButtonClick = () => router.push("/");

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col items-center justify-center text-center p-4">
      <div className="max-w-md">
        <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-6">
          <SearchX className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
        <p className="mt-4 text-slate-600">{message}</p>
        <div className="mt-8">
          <button
            onClick={handleButtonClick}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
