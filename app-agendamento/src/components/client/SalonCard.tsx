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
    e.stopPropagation();
    onToggleFavorite(salon.id);
  };

  return (
    // ALTERAÇÃO: Estilo do cartão principal para um visual mais "premium"
    <div className="group bg-white rounded-2xl shadow-lg shadow-slate-200/60 overflow-hidden h-full flex flex-col transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
      <div className="relative w-full h-40 bg-slate-100">
        <Image
          src={imageSrc}
          alt={`Foto de ${salon.name}`}
          fill
          className="object-contain" // A sua regra de object-contain mantida
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm text-slate-700 hover:text-red-500 transition-colors duration-200 z-10"
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
        <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-teal-600 transition-colors">
          {salon.name}
        </h3>
        <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="truncate">{salon.address}</span>
        </p>

        {/* Links de contacto mantidos */}
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
          <Heart className="w-4 h-4 text-red-400" />
          <span className="font-semibold">{salon.favoritesCount ?? 0}</span>
          <span className="text-slate-400">Favoritos</span>
        </div>

        <div className="mt-auto pt-4">
          {/* ALTERAÇÃO: Botão de ação com o nosso gradiente padrão */}
          <Link
            href={`/client/salon/${salon.slug}`}
            className="block w-full text-center bg-gradient-to-r from-indigo-600 to-teal-600 text-white font-semibold py-2.5 rounded-lg shadow-md group-hover:shadow-lg transition-all"
          >
            Ver Serviços
          </Link>
        </div>
      </div>
    </div>
  );
}
