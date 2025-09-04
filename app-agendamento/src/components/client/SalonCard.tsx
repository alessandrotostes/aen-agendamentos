"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Salon } from "../../types";
<<<<<<< HEAD
import { Heart, MapPin, Phone } from "lucide-react";
=======
import { Heart, MapPin, Star } from "lucide-react"; // Importando os novos ícones
>>>>>>> parent of fab462e (feat: aprimorar componentes de UI e adicionar novos modais para cancelamento e reembolso)

interface SalonCardProps {
  salon: Salon;
  isFavorite: boolean;
  onToggleFavorite: (salonId: string) => void;
}

export default function SalonCard({
  salon,
  isFavorite,
  onToggleFavorite,
}: SalonCardProps) {
  const placeholder = "/placeholder.png";
  const imageSrc =
    salon.imageURL && salon.imageURL.trim() !== ""
      ? salon.imageURL
      : placeholder;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggleFavorite(salon.id);
  };

  // --- NOVA FUNÇÃO PARA LIDAR COM O CLIQUE NO TELEFONE ---
  const handlePhoneClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Impede a navegação do Link pai
    e.stopPropagation(); // Impede que outros eventos de clique sejam disparados
    if (salon.phone) {
      window.location.href = `tel:${salon.phone}`;
    }
  };

  return (
    <Link href={`/client/salon/${salon.id}`} className="group block">
      <div className="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
        <div className="relative w-full h-40">
          <Image
            src={imageSrc}
            alt={`Foto de ${salon.name}`}
            fill
<<<<<<< HEAD
            className="object-contain"
=======
            className="object-cover"
>>>>>>> parent of fab462e (feat: aprimorar componentes de UI e adicionar novos modais para cancelamento e reembolso)
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/70 backdrop-blur-sm text-slate-700 hover:text-red-500 transition-colors duration-200"
            aria-label="Adicionar aos favoritos"
          >
            <Heart
              className={`w-5 h-5 transition-all ${
                isFavorite ? "text-red-500 fill-current" : ""
              }`}
            />
          </button>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-bold text-slate-900 truncate">
            {salon.name}
          </h3>
          <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">{salon.address}</span>
          </p>
<<<<<<< HEAD

          {/* --- BLOCO DO TELEFONE CORRIGIDO --- */}
          {salon.phone && (
            <div
              onClick={handlePhoneClick} // Usamos onClick em uma div
              className="flex items-center gap-1.5 text-sm text-slate-500 mt-1 hover:text-teal-600 cursor-pointer" // Adicionado cursor-pointer
            >
              <Phone className="w-4 h-4 shrink-0" />
              <span>{salon.phone}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-sm text-slate-600 mt-3">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="font-semibold">{salon.favoritesCount ?? 0}</span>
            <span className="text-slate-400">Favoritos</span>
=======
          <div className="flex items-center gap-1 text-sm text-slate-600 mt-3">
            <Star className="w-4 h-4 text-amber-400 fill-current" />
            <span className="font-semibold">
              {salon.rating?.toFixed(1) ?? "Novo"}
            </span>
            <span className="text-slate-400">(25 avaliações)</span>{" "}
            {/* Placeholder */}
>>>>>>> parent of fab462e (feat: aprimorar componentes de UI e adicionar novos modais para cancelamento e reembolso)
          </div>
          <div className="mt-auto pt-4">
            <div className="w-full text-center bg-teal-600 text-white font-semibold py-2.5 rounded-lg transition-colors group-hover:bg-teal-700">
              Ver Serviços
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
