import React from "react";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  // ALTERAÇÃO 1: Adicionar 'red' à lista de cores permitidas
  color?: "blue" | "purple" | "emerald" | "red";
}

export default function StatsCard({
  title,
  value,
  icon: IconComponent,
  color = "blue",
}: StatsCardProps) {
  // ALTERAÇÃO 2: Adicionar os estilos para a nova cor 'red'
  const colorClasses = {
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    purple: { bg: "bg-purple-100", text: "text-purple-600" },
    emerald: { bg: "bg-emerald-100", text: "text-emerald-600" },
    red: { bg: "bg-red-100", text: "text-red-600" },
  };

  // Esta linha agora funcionará corretamente com a cor 'red'
  const currentColors = colorClasses[color];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-5 transition-transform transform hover:scale-105">
      <div
        className={`w-14 h-14 rounded-lg flex items-center justify-center ${currentColors.bg}`}
      >
        <IconComponent className={`w-7 h-7 ${currentColors.text}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
      </div>
    </div>
  );
}
