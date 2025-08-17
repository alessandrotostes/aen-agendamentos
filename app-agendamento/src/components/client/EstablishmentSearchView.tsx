"use client";

import React, { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  query,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { Salon } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import SalonCard from "./SalonCard"; // Importamos o nosso novo SalonCard
import { ArrowLeft, Search } from "lucide-react"; // Importando ícones modernos

interface EstablishmentSearchViewProps {
  onNavigateBack: () => void;
}

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

    let favUnsub = () => {};
    if (userData?.uid) {
      favUnsub = onSnapshot(
        collection(db, `users/${userData.uid}/favorites`),
        (snap) => {
          setFavorites(snap.docs.map((d) => d.id));
        }
      );
    }

    return () => {
      estUnsub();
      favUnsub();
    };
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
      <div className="text-center text-slate-500 py-10">
        Carregando estabelecimentos...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* --- ALTERAÇÃO: BOTÃO DE VOLTAR MODERNIZADO --- */}
      <button
        onClick={onNavigateBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-teal-600 transition"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar ao Painel
      </button>

      {/* --- ALTERAÇÃO: LAYOUT DA BUSCA MODERNIZADO --- */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          Encontre seu próximo agendamento
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-600">
          Explore os melhores salões e barbearias perto de você.
        </p>
      </div>

      <div className="relative max-w-xl mx-auto">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar por nome do estabelecimento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
        />
      </div>

      {/* --- ALTERAÇÃO: GRID COM O NOVO SALONCARD --- */}
      {filteredEstablishments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEstablishments.map((est) => (
            <SalonCard
              key={est.id}
              salon={est}
              isFavorite={favorites.includes(est.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-slate-500">Nenhum estabelecimento encontrado.</p>
        </div>
      )}
    </div>
  );
}
