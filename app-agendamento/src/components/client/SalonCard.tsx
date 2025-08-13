"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Salon } from "../../types";
import { HeartIcon as OutlineHeart } from "@heroicons/react/24/outline";
import { HeartIcon as SolidHeart } from "@heroicons/react/24/solid";

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
  const placeholder = "/placeholder.png"; // coloque um arquivo no public/ ou troque por URL do Storage
  const imageSrc =
    salon.imageURL && salon.imageURL.trim() !== ""
      ? salon.imageURL
      : placeholder;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col">
      <div className="relative w-full h-40 rounded-md overflow-hidden mb-4">
        <Image
          src={imageSrc}
          alt={salon.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{salon.name}</h3>
        <button
          onClick={() => onToggleFavorite(salon.id)}
          aria-label="Toggle Favorite"
        >
          {isFavorite ? (
            <SolidHeart className="w-6 h-6 text-red-500" />
          ) : (
            <OutlineHeart className="w-6 h-6 text-gray-400 hover:text-red-500 transition" />
          )}
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-2">{salon.address}</p>
      <div className="flex items-center text-yellow-500 mb-4">
        {"★".repeat(Math.round(salon.rating || 0))}
        <span className="text-gray-500 text-sm ml-1">
          ({salon.rating?.toFixed(1) ?? "0.0"})
        </span>
      </div>
      <Link
        href={`/client/salon/${salon.id}`}
        className="mt-auto inline-block text-center bg-teal-500 text-white py-2 rounded hover:bg-teal-600 transition"
      >
        Ver Detalhes
      </Link>
    </div>
  );
}
