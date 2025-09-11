// src/app/client/salon/[slug]/page.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { ClientRoute } from "../../../../components/auth/ProtectedRoute";
import { db } from "../../../../lib/firebaseConfig";
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import Image from "next/image";
import { Establishment, Service, Professional } from "../../../../types";
import SchedulingModal from "../../../../components/client/modals/SchedulingModal";
import { currencyUtils } from "../../../../lib/utils";
import {
  ArrowLeft,
  Users,
  CalendarPlus,
  MapPin,
  Phone,
  Instagram,
  Clock,
} from "lucide-react";

// --- COMPONENTE: CARD DO PROFISSIONAL (Estilo Refinado) ---
const ProfessionalCard = ({
  professional,
  allServices,
}: {
  professional: Professional;
  allServices: Service[];
}) => {
  const professionalServices = useMemo(
    () =>
      allServices
        .filter((service) => professional.serviceIds.includes(service.id))
        .map((service) => service.name),
    [allServices, professional]
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 border border-transparent hover:border-teal-200 hover:shadow-lg transition-all duration-300">
      {/* ================================================================= */}
      {/* ===== ALTERAÇÃO AQUI: CONTAINER DE IMAGEM REDONDO E FIXO ======== */}
      {/* ================================================================= */}
      <div className="relative w-16 h-16 shrink-0 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
        <Image
          src={professional.photoURL || "/images/default-avatar.png"}
          alt={professional.firstName || "Foto do Profissional"}
          fill // Usa 'fill' para que a imagem preencha o container
          className="object-cover" // Garante que a imagem cubra o espaço sem distorção
          sizes="64px" // Otimização de tamanho para a imagem
        />
      </div>
      {/* ================================================================= */}
      <div className="flex-grow">
        <h4 className="font-bold text-lg text-slate-900">
          {professional.firstName}
        </h4>
        {professionalServices.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {professionalServices.slice(0, 3).map((serviceName) => (
              <span
                key={serviceName}
                className="text-xs font-medium bg-teal-50 text-teal-700 px-2 py-1 rounded-full"
              >
                {serviceName}
              </span>
            ))}
            {professionalServices.length > 3 && (
              <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                +{professionalServices.length - 3} mais
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- COMPONENTE: CARD DE SERVIÇO (Refatorado com Duração) ---
const ServiceCard = ({
  service,
  onServiceClick,
}: {
  service: Service;
  onServiceClick: (service: Service) => void;
}) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-transparent hover:border-teal-200">
      <div className="flex-grow">
        <p className="font-bold text-slate-900 text-lg">{service.name}</p>
        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
          {service.description}
        </p>
        <div className="flex items-center text-sm text-gray-500 mt-3">
          <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
          <span>Duração: {service.duration} min</span>
        </div>
      </div>
      <div className="text-left sm:text-right shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
        <p className="font-bold text-xl text-teal-600">
          {currencyUtils.format(service.price)}
        </p>
        <button
          onClick={() => onServiceClick(service)}
          className="mt-2 w-full sm:w-auto px-6 py-2 text-sm bg-teal-600 text-white font-semibold rounded-lg shadow-sm hover:bg-teal-700 transition"
        >
          Agendar
        </button>
      </div>
    </div>
  );
};

// --- PÁGINA PRINCIPAL DE DETALHES DO SALÃO ---
export default function SalonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const salonSlug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [salon, setSalon] = useState<Establishment | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    if (!salonSlug) return;

    setLoading(true);

    const fetchSalonBySlug = async () => {
      try {
        const establishmentsRef = collection(db, "establishments");
        const q = query(
          establishmentsRef,
          where("slug", "==", salonSlug),
          limit(1)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.error("Nenhum estabelecimento encontrado com este slug.");
          setSalon(null);
          return null;
        }

        const salonDoc = querySnapshot.docs[0];
        const salonData = {
          id: salonDoc.id,
          ...(salonDoc.data() as Omit<Establishment, "id">),
        };

        setSalon(salonData);
        return salonData.id;
      } catch (error) {
        console.error("Erro ao buscar salão pelo slug:", error);
        setSalon(null);
        return null;
      }
    };

    const setupListeners = (salonId: string) => {
      const servicesUnsub = onSnapshot(
        query(collection(db, "establishments", salonId, "services")),
        (snapshot) =>
          setServices(
            snapshot.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<Service, "id">),
            }))
          )
      );

      const professionalsUnsub = onSnapshot(
        query(collection(db, "establishments", salonId, "professionals")),
        (snapshot) =>
          setProfessionals(
            snapshot.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<Professional, "id">),
            }))
          )
      );

      return () => {
        servicesUnsub();
        professionalsUnsub();
      };
    };

    let listenersUnsubscribe: (() => void) | undefined;

    const initializePage = async () => {
      const foundSalonId = await fetchSalonBySlug();
      if (foundSalonId) {
        listenersUnsubscribe = setupListeners(foundSalonId);
      }
      setLoading(false);
    };

    initializePage();

    return () => {
      if (listenersUnsubscribe) {
        listenersUnsubscribe();
      }
    };
  }, [salonSlug]);

  const openSchedulingModal = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="text-center p-8 text-slate-500">Carregando...</div>;
  }
  if (!salon) {
    return notFound();
  }

  const imageSrc = salon.imageURL || "/placeholder.png";
  const mapsUrl = salon.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        salon.address
      )}`
    : "#";

  return (
    <ClientRoute>
      <div className="bg-slate-50 min-h-screen">
        <main className="max-w-6xl mx-auto pb-12">
          <div className="relative w-full h-52 md:h-64 rounded-b-3xl overflow-hidden">
            <Image
              src={imageSrc}
              alt={`Imagem de ${salon.name}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute top-4 left-4 z-10">
              <button
                onClick={() => router.back()}
                className="bg-white/80 backdrop-blur-sm text-slate-800 p-2 rounded-full hover:bg-white transition-all shadow-md"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 p-6 ">
              <h1 className="text-3xl md:text-4xl font-bold text-white shadow-md">
                {salon.name}
              </h1>

              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-1 mt-3">
                {salon.address && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-slate-200 hover:text-white transition-colors"
                  >
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="text-sm">{salon.address}</span>
                  </a>
                )}

                {salon.phone && (
                  <a
                    href={`tel:${salon.phone}`}
                    className="flex items-center gap-2 text-slate-200 mt-1 sm:mt-0 hover:text-white transition-colors"
                  >
                    <Phone className="w-4 h-4 shrink-0" />
                    <span className="text-sm">{salon.phone}</span>
                  </a>
                )}

                {salon.socialLinks?.instagram && (
                  <a
                    href={salon.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-slate-200 mt-1 sm:mt-0 hover:text-white transition-colors"
                  >
                    <Instagram className="w-4 h-4 shrink-0" />
                    <span className="text-sm">Instagram</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mt-4">
            <div className="lg:col-span-2 space-y-10">
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <CalendarPlus className="w-6 h-6 text-teal-600" />
                  <h2 className="text-2xl font-bold text-slate-900">
                    Nossos Serviços
                  </h2>
                </div>
                <div className="space-y-4">
                  {services.length > 0 ? (
                    services.map((service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        onServiceClick={openSchedulingModal}
                      />
                    ))
                  ) : (
                    <p className="text-slate-500 bg-white p-4 rounded-lg">
                      Nenhum serviço cadastrado.
                    </p>
                  )}
                </div>
              </section>
            </div>
            <div className="lg:col-span-1 space-y-10">
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <Users className="w-6 h-6 text-teal-600" />
                  <h2 className="text-2xl font-bold text-slate-900">
                    Nossa Equipe
                  </h2>
                </div>
                <div className="space-y-4">
                  {professionals.length > 0 ? (
                    professionals.map((prof) => (
                      <ProfessionalCard
                        key={prof.id}
                        professional={prof}
                        allServices={services}
                      />
                    ))
                  ) : (
                    <p className="text-slate-500 bg-white p-4 rounded-lg">
                      Nenhum profissional cadastrado.
                    </p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>

        {isModalOpen && selectedService && (
          <SchedulingModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedService(null);
            }}
            service={selectedService}
            professionals={professionals}
            establishmentId={salon.id}
          />
        )}
      </div>
    </ClientRoute>
  );
}
