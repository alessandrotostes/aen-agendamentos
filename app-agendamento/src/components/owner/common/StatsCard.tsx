import React from "react";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon; // A prop 'icon' agora espera um componente de ícone
  color?: "blue" | "purple" | "emerald"; // Cores alinhadas com o DashboardTab
}

export default function StatsCard({
  title,
  value,
  icon: IconComponent, // Renomeamos a prop para usar como componente
  color = "blue",
}: StatsCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-5 transition-transform transform hover:scale-105">
      <div
        className={`w-14 h-14 rounded-lg flex items-center justify-center ${colorClasses[color]}`}
      >
        {/* Renderizamos o ícone com o tamanho correto */}
        <IconComponent className="w-7 h-7" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
      </div>
    </div>
  );
}
