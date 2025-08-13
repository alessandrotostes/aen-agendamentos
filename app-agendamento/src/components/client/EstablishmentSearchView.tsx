"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  query,
  onSnapshot,
  DocumentData,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { Salon } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { HeartIcon as OutlineHeart } from "@heroicons/react/24/outline";
import { HeartIcon as SolidHeart } from "@heroicons/react/24/solid";

interface EstablishmentSearchViewProps {
  onNavigateBack: () => void;
}

const DashboardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
    />
  </svg>
);
const StarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4 mr-1"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);
const LocationPinIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4 mr-1 text-gray-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const SalonCard = ({
  salon,
  isFavorite,
  onToggleFavorite,
}: {
  salon: Salon;
  isFavorite: boolean;
  onToggleFavorite: (salonId: string) => void;
}) => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
    <div className="relative w-full h-40">
      <Image
        src={salon.imageURL || "/images/placeholder.png"}
        alt={`Logo de ${salon.name}`}
        fill
        className="object-cover"
      />
    </div>
    <div className="p-5">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800 truncate">
          {salon.name}
        </h3>
        <button onClick={() => onToggleFavorite(salon.id)}>
          {isFavorite ? (
            <SolidHeart className="w-6 h-6 text-red-500" />
          ) : (
            <OutlineHeart className="w-6 h-6 text-gray-400 hover:text-red-500" />
          )}
        </button>
      </div>
      <p className="text-gray-600 text-sm flex items-center mt-2">
        <LocationPinIcon /> {salon.address}
      </p>
      <div className="mt-4 pt-4 border-t flex justify-between items-center">
        <span className="text-sm text-gray-700 font-medium">
          {salon.mainService || "Diversos Serviços"}
        </span>
        <Link
          href={`/client/salon/${salon.id}`}
          className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg"
        >
          Ver mais
        </Link>
      </div>
    </div>
  </div>
);

export default function EstablishmentSearchView({
  onNavigateBack,
}: EstablishmentSearchViewProps) {
  const { userData } = useAuth();
  const [establishments, setEstablishments] = useState<Salon[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const estUnsub = onSnapshot(
      query(collection(db, "establishments")),
      (snap) => {
        setEstablishments(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as Salon))
        );
        setIsLoading(false);
      }
    );

    if (userData?.uid) {
      const favUnsub = onSnapshot(
        collection(db, `users/${userData.uid}/favorites`),
        (snap) => {
          setFavorites(snap.docs.map((d) => d.id));
        }
      );
      return () => {
        estUnsub();
        favUnsub();
      };
    }

    return () => estUnsub();
  }, [userData]);

  const handleToggleFavorite = async (salonId: string) => {
    if (!userData) return;
    const favRef = doc(db, "users", userData.uid, "favorites", salonId);
    if (favorites.includes(salonId)) {
      await deleteDoc(favRef);
    } else {
      await setDoc(favRef, { createdAt: new Date() });
    }
  };

  const filteredEstablishments = useMemo(() => {
    if (!searchTerm) return establishments;
    return establishments.filter((est) =>
      est.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, establishments]);

  if (isLoading) {
    return (
      <div className="text-center text-gray-600">
        Carregando estabelecimentos...
      </div>
    );
  }

  return (
    <div>
      <div className="w-full flex justify-end mb-6">
        <button
          onClick={onNavigateBack}
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700"
        >
          <DashboardIcon /> Voltar ao Meu Painel
        </button>
      </div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900">
          Encontre seu próximo agendamento
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
          Explore os estabelecimentos disponíveis na sua região.
        </p>
      </div>
      <div className="mb-12 max-w-lg mx-auto">
        <input
          type="text"
          placeholder="Buscar pelo nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-5 py-3 border rounded-full shadow-sm"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredEstablishments.map((est) => (
          <SalonCard
            key={est.id}
            salon={est}
            isFavorite={favorites.includes(est.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}
