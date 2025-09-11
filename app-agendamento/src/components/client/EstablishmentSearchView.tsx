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
  getDocs,
} from "firebase/firestore";
import { Salon } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import SalonCard from "./SalonCard";
import { ArrowLeft, Search, XCircle } from "lucide-react";

// ==========================================================
// ===== COMPONENTE DE ESQUELETO (SKELETON) PARA LOADING ====
// ==========================================================
const SalonCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col">
    <div className="relative w-full h-40 bg-slate-200 animate-pulse" />
    <div className="p-4 flex flex-col flex-grow">
      <div className="h-6 w-3/4 bg-slate-200 rounded animate-pulse" />
      <div className="h-4 w-1/2 bg-slate-200 rounded mt-2 animate-pulse" />
      <div className="mt-auto pt-4">
        <div className="w-full h-10 bg-slate-200 rounded-lg animate-pulse" />
      </div>
    </div>
  </div>
);

// ==========================================================
// ===== COMPONENTE DE ESTADO VAZIO (EMPTY STATE) ===========
// ==========================================================
const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-16 col-span-full">
    <XCircle className="mx-auto h-12 w-12 text-slate-300" />
    <h3 className="mt-4 text-lg font-semibold text-slate-700">
      Nenhum Resultado
    </h3>
    <p className="mt-1 text-slate-500">{message}</p>
  </div>
);

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
  const [allServices, setAllServices] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState<string>("Todos");

  useEffect(() => {
    setIsLoading(true);
    const estQuery = query(collection(db, "establishments"));
    const estUnsub = onSnapshot(
      estQuery,
      (snap) => {
        setEstablishments(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as Salon))
        );
        setIsLoading(false);
      },
      (error) => {
        console.error("Erro ao ouvir estabelecimentos:", error);
        setIsLoading(false);
      }
    );

    let favUnsub = () => {};
    if (userData?.uid) {
      const favQuery = collection(db, `users/${userData.uid}/favorites`);
      favUnsub = onSnapshot(favQuery, (snap) => {
        setFavorites(snap.docs.map((d) => d.id));
      });
    }

    return () => {
      estUnsub();
      favUnsub();
    };
  }, [userData]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const estQuery = query(collection(db, "establishments"));
        const snapshot = await getDocs(estQuery);
        const servicesSet = new Set<string>();
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.mainService) {
            servicesSet.add(data.mainService);
          }
        });
        setAllServices(["Todos", ...Array.from(servicesSet).sort()]);
      } catch (error) {
        console.error("Erro ao buscar serviços para o filtro:", error);
      }
    };
    fetchServices();
  }, []);

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
    return establishments.filter((est) => {
      const matchesSearchTerm = est.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesService =
        selectedService === "Todos" || est.mainService === selectedService;
      return matchesSearchTerm && matchesService;
    });
  }, [searchTerm, selectedService, establishments]);

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-8">
        <button
          onClick={onNavigateBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-teal-600 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao Painel
        </button>

        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Encontre seu próximo agendamento
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-600">
            Explore os melhores estabelecimentos para você.
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

        <div className="flex justify-center flex-wrap gap-3 pt-4 border-t border-slate-200">
          {allServices.map((service) => (
            <button
              key={service}
              onClick={() => setSelectedService(service)}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                selectedService === service
                  ? "bg-teal-600 text-white shadow-md scale-105"
                  : "bg-white text-slate-700 hover:bg-slate-100 border"
              }`}
            >
              {service}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            // Exibe 8 cartões de esqueleto enquanto carrega
            Array.from({ length: 8 }).map((_, i) => (
              <SalonCardSkeleton key={i} />
            ))
          ) : filteredEstablishments.length > 0 ? (
            filteredEstablishments.map((est) => (
              <SalonCard
                key={est.id}
                salon={est}
                isFavorite={favorites.includes(est.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))
          ) : (
            <EmptyState message="Nenhum estabelecimento encontrado com os filtros selecionados." />
          )}
        </div>
      </div>
    </div>
  );
}
