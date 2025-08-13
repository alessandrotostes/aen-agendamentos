"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ClientRoute } from "../../../../components/auth/ProtectedRoute";
import { db } from "../../../../lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import { Salon, Service, Professional } from "../../../../types";
import {
  useServices,
  useProfessionals,
} from "../../../../hooks/useEstablishment";
import SchedulingModal from "../../../../components/client/modals/SchedulingModal";
import { currencyUtils } from "../../../../lib/utils";

export default function SalonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const salonId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);

  // Usando nossos hooks aprimorados para buscar os dados deste salão
  const { services, loading: servicesLoading } = useServices(salonId);
  const { professionals, loading: professionalsLoading } =
    useProfessionals(salonId);

  // Estados para controlar o modal de agendamento
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    if (!salonId) return;
    const fetchSalon = async () => {
      try {
        const ref = doc(db, "establishments", salonId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setSalon({ id: snap.id, ...(snap.data() as Omit<Salon, "id">) });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSalon();
  }, [salonId]);

  const openSchedulingModal = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="text-center p-8">Carregando informações do salão...</div>
    );
  }

  if (!salon) {
    return (
      <div className="text-center p-8">Estabelecimento não encontrado.</div>
    );
  }

  const imageSrc = salon.imageURL || "/placeholder.png";

  return (
    <ClientRoute>
      <div className="bg-gray-50 min-h-screen">
        <main className="max-w-5xl mx-auto pb-12">
          {/* Hero Image */}
          <div className="relative w-full h-48 md:h-64 rounded-b-2xl overflow-hidden shadow-lg">
            <Image
              src={imageSrc}
              alt={salon.name}
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white shadow-md">
                {salon.name}
              </h1>
              <p className="text-gray-200 mt-1">{salon.address}</p>
            </div>
            {/* Botão Voltar */}
            <button
              onClick={() => router.back()}
              className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm text-gray-800 p-2 rounded-full hover:bg-white transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Serviços Disponíveis
              </h2>
              <div className="space-y-4">
                {services.length > 0 ? (
                  services.map((service) => (
                    <div
                      key={service.id}
                      className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center transition hover:shadow-md"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {service.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {service.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-teal-600">
                          {currencyUtils.format(service.price)}
                        </p>
                        <button
                          onClick={() => openSchedulingModal(service)}
                          className="mt-2 px-4 py-2 text-sm bg-teal-500 text-white font-semibold rounded-md hover:bg-teal-600"
                        >
                          Agendar
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">
                    Nenhum serviço cadastrado para este estabelecimento.
                  </p>
                )}
              </div>
            </div>
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Nossa Equipe
              </h2>
              <div className="space-y-4">
                {professionals.length > 0 ? (
                  professionals.map((prof) => (
                    <div
                      key={prof.id}
                      className="bg-white p-3 rounded-lg shadow-sm flex items-center space-x-4"
                    >
                      <Image
                        src={prof.photoURL || "/images/default-avatar.png"}
                        alt={prof.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {prof.name}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">
                    Nenhum profissional cadastrado.
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>

        <SchedulingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          service={selectedService}
          professionals={professionals}
          establishmentId={salon.id}
        />
      </div>
    </ClientRoute>
  );
}
