"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../../../../contexts/AuthContext";
import RegisterModal from "../../../../components/client/modals/RegisterModal";
import { db } from "../../../../lib/firebaseConfig";
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { Establishment, Service, Professional } from "../../../../types";
import SchedulingModal from "../../../../components/client/modals/SchedulingModal";
import { currencyUtils } from "../../../../lib/utils";
import EmptyState from "../../../../components/owner/common/EmptyState";
import {
  ArrowLeft,
  Users,
  CalendarPlus,
  MapPin,
  Phone,
  Instagram,
  Clock,
  Search,
  X,
} from "lucide-react";
// A importação abaixo não é mais necessária nesta página se o fluxo for apenas pelo modal
// import CompleteProfileView from "@/components/auth/CompleteProfileView";

// --- COMPONENTES INTERNOS ---

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
    <div className="bg-white p-4 rounded-xl shadow-lg shadow-slate-200/60 flex items-center gap-4 border border-transparent hover:border-teal-300 transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative w-16 h-16 shrink-0 rounded-full overflow-hidden bg-slate-100">
        <Image
          src={professional.photoURL || "/images/default-avatar.png"}
          alt={professional.firstName || "Foto do Profissional"}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>
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

const ServiceCard = ({
  service,
  onServiceClick,
}: {
  service: Service;
  onServiceClick: (service: Service) => void;
}) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-lg shadow-slate-200/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300 transform hover:scale-[1.02]">
      <div className="flex-grow">
        <p className="font-bold text-slate-900 text-lg">{service.name}</p>
        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
          {service.description}
        </p>
        <div className="flex items-center text-sm text-slate-500 mt-3">
          <Clock className="w-4 h-4 mr-1.5 text-slate-400" />
          <span>Duração: {service.duration} min</span>
        </div>
      </div>
      <div className="text-left sm:text-right shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
        <p className="font-bold text-xl text-teal-600">
          {currencyUtils.format(service.price)}
        </p>
        <button
          onClick={() => onServiceClick(service)}
          className="mt-2 w-full sm:w-auto px-6 py-2 text-sm bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          Agendar
        </button>
      </div>
    </div>
  );
};

const SalonPageSkeleton = () => (
  <div className="max-w-6xl mx-auto pb-12 animate-pulse">
    <div className="relative w-full h-52 md:h-64 rounded-b-3xl bg-slate-200" />
    <div className="p-4 sm:p-6">
      <div className="h-16 w-full bg-slate-200 rounded-xl" />
    </div>
    <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
      <div className="lg:col-span-2 space-y-4">
        <div className="h-8 w-1/2 bg-slate-200 rounded-lg" />
        <div className="h-10 w-full bg-slate-200 rounded-lg" />
        <div className="h-32 w-full bg-slate-200 rounded-xl mt-6" />
        <div className="h-32 w-full bg-slate-200 rounded-xl" />
      </div>
      <div className="lg:col-span-1 space-y-4">
        <div className="h-8 w-3/4 bg-slate-200 rounded-lg" />
        <div className="h-24 w-full bg-slate-200 rounded-xl mt-6" />
        <div className="h-24 w-full bg-slate-200 rounded-xl" />
      </div>
    </div>
  </div>
);

export default function SalonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const salonSlug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const { userData, authLoading, refreshUserData } = useAuth();
  const [salon, setSalon] = useState<Establishment | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

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

  useEffect(() => {
    // Este useEffect reage a mudanças e pode abrir o modal de agendamento
    // se as condições forem atendidas (ex: após um refresh da página).
    if (
      selectedService &&
      userData &&
      userData.profileStatus === "complete" &&
      !isSchedulingModalOpen
    ) {
      setIsSchedulingModalOpen(true);
    }
  }, [userData, selectedService, isSchedulingModalOpen]);

  const filteredServices = useMemo(() => {
    if (!searchTerm) {
      return services;
    }
    return services.filter((service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [services, searchTerm]);

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    if (userData && userData.profileStatus === "complete") {
      setIsSchedulingModalOpen(true);
    } else {
      setIsRegisterModalOpen(true);
    }
  };

  const onRegisterSuccess = async () => {
    setIsRegisterModalOpen(false);
    try {
      await refreshUserData();
      // O useEffect acima irá capturar a mudança no `userData`
      // e abrir o modal de agendamento se um serviço estiver selecionado.
      // Para uma experiência mais imediata, também podemos acioná-lo aqui.
      if (selectedService) {
        setIsSchedulingModalOpen(true);
      }
    } catch (error) {
      console.error("ERRO ao executar refreshUserData:", error);
    }
  };

  if (authLoading || loading) {
    return <SalonPageSkeleton />;
  }

  // ==================================================================
  // BLOCO DE CÓDIGO REMOVIDO
  // A lógica abaixo estava a causar o conflito, renderizando
  // o CompleteProfileView e interrompendo o fluxo do RegisterModal.
  /*
  if (userData && userData.profileStatus === "incomplete") {
    return <CompleteProfileView />;
  }
  */
  // ==================================================================

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
    <div className="bg-slate-50 min-h-screen relative overflow-hidden">
      <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/2 w-[150vw] h-[100vh] bg-gradient-to-br from-teal-100 via-white to-white rounded-full opacity-50" />
      <main className="max-w-6xl mx-auto pb-12 z-10 relative">
        <div className="relative w-full h-52 md:h-64 rounded-b-3xl overflow-hidden shadow-2xl shadow-slate-300/50">
          <Image
            src={imageSrc}
            alt={`Imagem de ${salon.name}`}
            fill
            className="object-cover bg-slate-800"
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
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="bg-white rounded-xl p-4 shadow-lg shadow-slate-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-slate-600 hover:text-teal-600 transition-colors"
            >
              <MapPin className="w-5 h-5 shrink-0 text-slate-400" />
              <span className="text-sm font-medium">
                {salon.address || "Endereço não informado"}
              </span>
            </a>
            <div className="flex items-center gap-4">
              {salon.phone && (
                <a
                  href={`tel:${salon.phone}`}
                  className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-medium">Ligar</span>
                </a>
              )}
              {salon.socialLinks?.instagram && (
                <a
                  href={salon.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  <span className="text-sm font-medium">Instagram</span>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-6">
            <section>
              <div className="flex items-center gap-3">
                <CalendarPlus className="w-6 h-6 text-teal-600" />
                <h2 className="text-2xl font-bold text-slate-900">
                  Nossos Serviços
                </h2>
              </div>
              <div className="relative mt-4">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nome do serviço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    aria-label="Limpar busca"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <div className="space-y-4 mt-6">
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onServiceClick={handleServiceClick}
                    />
                  ))
                ) : (
                  <EmptyState
                    message={
                      services.length > 0
                        ? `Nenhum serviço encontrado para "${searchTerm}".`
                        : "Nenhum serviço cadastrado."
                    }
                    icon={services.length > 0 ? Search : CalendarPlus}
                  />
                )}
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8 space-y-6">
              <section>
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-teal-700" />
                  <h2 className="text-2xl font-bold text-slate-900">
                    Nossa Equipe
                  </h2>
                </div>
                <div className="space-y-4 mt-6">
                  {professionals.length > 0 ? (
                    professionals.map((prof) => (
                      <ProfessionalCard
                        key={prof.id}
                        professional={prof}
                        allServices={services}
                      />
                    ))
                  ) : (
                    <EmptyState
                      message="Nenhum profissional cadastrado."
                      icon={Users}
                    />
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {isSchedulingModalOpen && selectedService && salon && (
        <SchedulingModal
          isOpen={isSchedulingModalOpen}
          onClose={() => {
            setIsSchedulingModalOpen(false);
            setSelectedService(null);
          }}
          service={selectedService}
          professionals={professionals}
          establishmentId={salon.id}
        />
      )}

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={onRegisterSuccess}
      />
    </div>
  );
}
