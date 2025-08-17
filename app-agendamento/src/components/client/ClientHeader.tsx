"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  Heart as HeartIcon,
  Search as MagnifyingGlassIcon,
} from "lucide-react";

type ClientHeaderProps = {
  onSearchClick: () => void;
  onFavoritesClick: () => void;
};

export default function ClientHeader({
  onSearchClick,
  onFavoritesClick,
}: ClientHeaderProps) {
  const { userData } = useAuth();

  return (
    <div className="flex items-center gap-3">
      {/* Avatar + nome */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-10 w-10 md:h-11 md:w-11 rounded-full bg-teal-600 text-white flex items-center justify-center font-semibold">
          {userData?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500">Bem-vindo(a)</p>
          <h1 className="text-base md:text-lg font-semibold text-slate-900 truncate">
            {userData?.name || "Cliente"}
          </h1>
        </div>
      </div>

      {/* Ações */}
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={onFavoritesClick}
          className="h-10 w-10 md:h-11 md:w-11 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          aria-label="Favoritos"
          type="button"
        >
          <HeartIcon className="h-5 w-5 mx-auto" />
        </button>

        <button
          onClick={onSearchClick}
          className="h-10 md:h-11 px-3 md:px-4 rounded-lg bg-teal-600 text-white font-medium inline-flex items-center gap-2 hover:bg-teal-700 active:scale-[0.98] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          type="button"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
          <span className="text-sm md:text-base">Buscar</span>
        </button>
      </div>
    </div>
  );
}
