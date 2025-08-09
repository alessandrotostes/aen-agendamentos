"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebaseConfig";
import {
  doc,
  onSnapshot,
  collection,
  query,
  DocumentData,
} from "firebase/firestore";
import DetailPageSkeleton from "@/components/DetailPageSkeleton";
import SchedulingModal from "@/components/SchedulingModal";

// Interfaces para a tipagem dos nossos dados
interface Establishment {
  businessName: string;
  phone: string;
  address: string;
}
interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}
interface Professional {
  id: string;
  name: string;
  serviceIds: string[];
  photoURL?: string;
}

export default function EstablishmentDetailPage() {
  const params = useParams();
  const establishmentId = params.establishmentId as string;

  const [establishment, setEstablishment] = useState<Establishment | null>(
    null
  );
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    if (!establishmentId) {
      setIsLoading(false);
      return;
    }

    const establishmentRef = doc(db, "establishments", establishmentId);
    const unsubscribeEst = onSnapshot(establishmentRef, (docSnap) => {
      if (docSnap.exists()) {
        setEstablishment(docSnap.data() as Establishment);
      } else {
        console.error("Estabelecimento não encontrado!");
        setEstablishment(null);
      }
      setIsLoading(false);
    });

    const servicesRef = collection(
      db,
      "establishments",
      establishmentId,
      "services"
    );
    const unsubscribeServices = onSnapshot(query(servicesRef), (snapshot) => {
      setServices(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Service))
      );
    });

    const professionalsRef = collection(
      db,
      "establishments",
      establishmentId,
      "professionals"
    );
    const unsubscribeProfs = onSnapshot(query(professionalsRef), (snapshot) => {
      setProfessionals(
        snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Professional)
        )
      );
    });

    return () => {
      unsubscribeEst();
      unsubscribeServices();
      unsubscribeProfs();
    };
  }, [establishmentId]);

  const handleOpenSchedulingModal = (service: Service) => {
    setSelectedService(service);
    setIsSchedulingModalOpen(true);
  };

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (!establishment) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          Estabelecimento não encontrado ou inválido.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        <header className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="mb-4">
              <Link
                href="/"
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Voltar para a lista
              </Link>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900">
              {establishment.businessName}
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              {establishment.address}
            </p>
            <p className="mt-1 text-md text-teal-600 font-semibold">
              {establishment.phone}
            </p>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <section className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Nossos Serviços
            </h2>
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              {services.length > 0 ? (
                services.map((service) => (
                  <div
                    key={service.id}
                    className="flex justify-between items-center border-b pb-4 last:border-b-0"
                  >
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {service.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {service.duration} minutos
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        R$ {service.price.toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleOpenSchedulingModal(service)}
                        className="mt-1 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-teal-700 transition-all"
                      >
                        Agendar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">
                  Nenhum serviço disponível no momento.
                </p>
              )}
            </div>
          </section>
          <aside className="lg:col-span-1">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Profissionais
            </h2>
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              {professionals.length > 0 ? (
                professionals.map((prof) => (
                  <div key={prof.id} className="flex items-center space-x-4">
                    {prof.photoURL ? (
                      <Image
                        src={prof.photoURL}
                        alt={prof.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-indigo-400 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-2xl font-bold text-white">
                          {prof.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {prof.name}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">
                  Não há profissionais cadastrados.
                </p>
              )}
            </div>
          </aside>
        </main>
      </div>

      <SchedulingModal
        isOpen={isSchedulingModalOpen}
        onClose={() => setIsSchedulingModalOpen(false)}
        service={selectedService}
        professionals={professionals}
        establishmentId={establishmentId}
      />
    </>
  );
}
