import React from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  message: string;
  icon: LucideIcon; // A prop 'icon' agora espera um componente
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({
  message,
  icon: IconComponent, // Renomeamos para usar como componente
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto bg-slate-100 text-slate-400 flex items-center justify-center rounded-full mb-4">
        {/* Renderizamos o ícone com o tamanho correto */}
        <IconComponent className="w-8 h-8" />
      </div>
      <p className="text-slate-500 mb-6">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-teal-500 to-indigo-400 text-white text-sm font-medium rounded-lg hover:from-teal-600 hover:to-indigo-500 transition-all duration-200 hover:scale-105 shadow-lg"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
