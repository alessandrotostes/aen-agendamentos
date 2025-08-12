"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image"; // Importando o componente de Imagem do Next.js
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  query,
  onSnapshot,
  DocumentData,
} from "firebase/firestore";

// Ícones
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

// Interface
interface Establishment extends DocumentData {
  id: string;
  businessName: string;
  address: string;
  logoUrl?: string;
  rating?: number;
  mainService?: string;
}

interface EstablishmentSearchViewProps {
  onNavigateBack: () => void;
}

const EstablishmentCard = ({
  establishment,
}: {
  establishment: Establishment;
}) => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
    {/* CORREÇÃO 2: Trocando <img> por <Image /> */}
    <Image
      src={
        establishment.logoUrl ||
        "https://placehold.co/600x400/e2e8f0/334155?text=Logo"
      }
      alt={`Logo de ${establishment.businessName}`}
      width={600}
      height={400}
      className="w-full h-40 object-cover"
    />
    <div className="p-5">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800 truncate">
          {establishment.businessName}
        </h3>
        {establishment.rating && (
          <div className="flex items-center bg-yellow-400 text-yellow-900 font-bold px-2 py-1 rounded-md text-sm shrink-0">
            <StarIcon /> {establishment.rating.toFixed(1)}
          </div>
        )}
      </div>
      <p className="text-gray-600 text-sm flex items-center mt-2">
        <LocationPinIcon /> {establishment.address}
      </p>
      <div className="mt-4 pt-4 border-t flex justify-between items-center">
        <span className="text-sm text-gray-700 font-medium">
          {establishment.mainService || "Diversos Serviços"}
        </span>
        <Link
          href={`/establishment/${establishment.id}`}
          className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 transition-colors text-sm"
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
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const establishmentsRef = collection(db, "establishments");
    const q = query(establishmentsRef);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setEstablishments(
        querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Establishment)
        )
      );
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredEstablishments = useMemo(() => {
    if (!searchTerm) return establishments;
    return establishments.filter((est) =>
      est.businessName.toLowerCase().includes(searchTerm.toLowerCase())
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
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700"
        >
          <DashboardIcon />
          Voltar ao Meu Painel
        </button>
      </div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl tracking-tight">
          Encontre seu próximo agendamento
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
          Explore os estabelecimentos disponíveis na sua região.
        </p>
      </div>
      <div className="mb-12 max-w-lg mx-auto">
        <input
          type="text"
          placeholder="Buscar pelo nome do estabelecimento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-5 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
      {filteredEstablishments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEstablishments.map((est) => (
            <EstablishmentCard key={est.id} establishment={est} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-10">
          {/* CORREÇÃO 1: Removendo as aspas para corrigir o erro */}
          <p>Nenhum estabelecimento encontrado com o nome: {searchTerm}</p>
        </div>
      )}
    </div>
  );
}
