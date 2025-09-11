"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Salon } from "../../types";
import { Heart, MapPin, Phone, Instagram } from "lucide-react";

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
    e.stopPropagation(); // Impede que o clique afete outros elementos
    onToggleFavorite(salon.id);
  };

  // ==========================================================
  // ===== ALTERAÇÃO 1: O <Link> FOI REMOVIDO DAQUI ===========
  // ==========================================================
  return (
    <div className="group bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative w-full h-40 bg-slate-100">
        <Image
          src={imageSrc}
          alt={`Foto de ${salon.name}`}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
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

        {/* Os links de telefone e Instagram agora funcionam corretamente */}
        {salon.phone && (
          <a
            href={`tel:${salon.phone}`}
            className="flex items-center gap-1.5 text-sm text-slate-500 mt-1 hover:text-teal-600 cursor-pointer"
          >
            <Phone className="w-4 h-4 shrink-0" />
            <span>{salon.phone}</span>
          </a>
        )}
        {salon.socialLinks?.instagram && (
          <a
            href={salon.socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-slate-500 mt-1 hover:text-teal-600 cursor-pointer"
          >
            <Instagram className="w-4 h-4 shrink-0" />
            <span>Instagram</span>
          </a>
        )}

        <div className="flex items-center gap-1.5 text-sm text-slate-600 mt-3">
          <Heart className="w-4 h-4 text-red-500" />
          <span className="font-semibold">{salon.favoritesCount ?? 0}</span>
          <span className="text-slate-400">Favoritos</span>
        </div>

        <div className="mt-auto pt-4">
          {/* ========================================================== */}
          {/* ===== ALTERAÇÃO 2: O <Link> AGORA ESTÁ AQUI ============== */}
          {/* ========================================================== */}
          <Link
            href={`/client/salon/${salon.slug}`}
            className="block w-full text-center bg-teal-600 text-white font-semibold py-2.5 rounded-lg transition-colors group-hover:bg-teal-700"
          >
            Ver Serviços
          </Link>
        </div>
      </div>
    </div>
  );
}
