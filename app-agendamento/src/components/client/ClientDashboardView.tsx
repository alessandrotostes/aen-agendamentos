"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useAppointments } from "../../hooks/useAppointments";
import { db, functions } from "../../lib/firebaseConfig";
import { httpsCallable } from "firebase/functions";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { Establishment, Appointment } from "../../types";
import EmptyState from "../owner/common/EmptyState";
import AppointmentCard from "./AppointmentCard";
import SalonCard from "./SalonCard";
import { Plus, Calendar, History, Heart } from "lucide-react";
import CancellationInfoModal from "../shared/modals/CancellationInfoModal";
import RefundConfirmationModal from "../shared/modals/RefundConfirmationModal";
import AlertModal from "../shared/modals/AlertModal";
import SuccessModal from "../shared/modals/SuccessModal";

const AppointmentCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm p-4 h-40 animate-pulse">
    <div className="flex gap-4">
      <div className="w-24 h-24 bg-slate-200 rounded-lg"></div>
      <div className="flex-1 space-y-3 py-1">
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        <div className="h-3 bg-slate-200 rounded w-1/3"></div>
      </div>
    </div>
  </div>
);

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

interface Props {
  onNavigateToSearch: () => void;
}

export default function ClientDashboardView({ onNavigateToSearch }: Props) {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "upcoming" | "history" | "favorites"
  >("upcoming");
  const [favoriteSalons, setFavoriteSalons] = useState<Establishment[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const {
    appointments,
    loading: appointmentsLoading,
    refresh: refreshAppointments,
  } = useAppointments();
  const [establishments, setEstablishments] = useState<
    Map<string, Establishment>
  >(new Map());
  const [loadingEstablishments, setLoadingEstablishments] = useState(true);
  const [isInfoModalOpen, setInfoModalOpen] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<Appointment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isAlertModalOpen, setAlertModalOpen] = useState(false);
  const [alertModalContent, setAlertModalContent] = useState({
    title: "",
    message: "",
  });
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const [successModalContent, setSuccessModalContent] = useState({
    title: "",
    message: "",
  });
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    const storedIds = localStorage.getItem("dismissedAppointments");
    if (storedIds) setDismissedIds(JSON.parse(storedIds));
  }, []);

  useEffect(() => {
    localStorage.setItem("dismissedAppointments", JSON.stringify(dismissedIds));
  }, [dismissedIds]);

  const handleDismiss = (appointmentId: string) => {
    setDismissedIds((prevIds) => [...prevIds, appointmentId]);
  };

  useEffect(() => {
    if (appointments.length === 0) {
      setLoadingEstablishments(false);
      return;
    }
    const establishmentIds = [
      ...new Set(appointments.map((a) => a.establishmentId)),
    ];
    if (establishmentIds.length === 0) {
      setLoadingEstablishments(false);
      return;
    }
    const q = query(
      collection(db, "establishments"),
      where("__name__", "in", establishmentIds)
    );
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const establishmentsMap = new Map<string, Establishment>();
        querySnapshot.forEach((doc) => {
          establishmentsMap.set(doc.id, {
            id: doc.id,
            ...doc.data(),
          } as Establishment);
        });
        setEstablishments(establishmentsMap);
        setLoadingEstablishments(false);
      },
      (error) => {
        console.error("Erro ao ouvir detalhes dos estabelecimentos:", error);
        setLoadingEstablishments(false);
      }
    );
    return () => unsubscribe();
  }, [appointments]);

  useEffect(() => {
    if (!userData?.uid) {
      setFavoritesLoading(false);
      return;
    }
    setFavoritesLoading(true);
    let unsubscribeEstablishments = () => {};
    const favoritesQuery = query(
      collection(db, `users/${userData.uid}/favorites`)
    );
    const unsubscribeFavorites = onSnapshot(
      favoritesQuery,
      (favSnapshot) => {
        unsubscribeEstablishments();
        const favoriteIds = favSnapshot.docs.map((doc) => doc.id);
        if (favoriteIds.length > 0) {
          const establishmentsQuery = query(
            collection(db, "establishments"),
            where("__name__", "in", favoriteIds)
          );
          unsubscribeEstablishments = onSnapshot(
            establishmentsQuery,
            (estSnapshot) => {
              const salons = estSnapshot.docs.map(
                (doc) => ({ id: doc.id, ...doc.data() } as Establishment)
              );
              setFavoriteSalons(salons);
              setFavoritesLoading(false);
            },
            (error) => {
              console.error("Erro ao ouvir estabelecimentos favoritos:", error);
              setFavoritesLoading(false);
            }
          );
        } else {
          setFavoriteSalons([]);
          setFavoritesLoading(false);
        }
      },
      (error) => {
        console.error("Erro ao ouvir favoritos:", error);
        setFavoritesLoading(false);
      }
    );
    return () => {
      unsubscribeFavorites();
      unsubscribeEstablishments();
    };
  }, [userData]);

  const handleOpenCancellationFlow = (appointment: Appointment) => {
    setAppointmentToCancel(appointment);
    setInfoModalOpen(true);
  };

  const handleConfirmCancellation = async () => {
    if (!appointmentToCancel) return;
    setIsCancelling(true);
    setConfirmModalOpen(false);
    try {
      const cancelFn = httpsCallable(functions, "clientCancelAppointment");
      await cancelFn({
        appointmentId: appointmentToCancel.id,
        establishmentId: appointmentToCancel.establishmentId,
      });
      setSuccessModalContent({
        title: "Cancelamento Solicitado",
        message:
          "O seu agendamento foi cancelado com sucesso e o estabelecimento notificado.",
      });
      setSuccessModalOpen(true);
      refreshAppointments();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível cancelar o agendamento. Tente novamente.";
      setAlertModalContent({
        title: "Erro no Cancelamento",
        message: message,
      });
      setAlertModalOpen(true);
    } finally {
      setIsCancelling(false);
      setAppointmentToCancel(null);
    }
  };

  const handleUnfavorite = async (salonId: string) => {
    if (!userData?.uid) {
      alert("Você precisa estar logado para desfavoritar.");
      return;
    }
    try {
      const favoriteRef = doc(db, "users", userData.uid, "favorites", salonId);
      await deleteDoc(favoriteRef);
    } catch (error) {
      console.error("Erro ao desfavoritar:", error);
      alert("Ocorreu um erro ao tentar desfavoritar o estabelecimento.");
    }
  };

  const handleShowAlert = (title: string, message: string) => {
    setAlertModalContent({ title, message });
    setAlertModalOpen(true);
  };

  const { upcomingAppointments, pastAppointments } = useMemo(() => {
    const upcoming = appointments.filter(
      (a) =>
        a.status === "confirmado" &&
        a.dateTime &&
        a.dateTime.toDate() > new Date() &&
        !dismissedIds.includes(a.id)
    );
    const past = appointments.filter(
      (a) =>
        (a.status !== "confirmado" ||
          (a.dateTime && a.dateTime.toDate() < new Date())) &&
        !dismissedIds.includes(a.id)
    );
    return { upcomingAppointments: upcoming, pastAppointments: past };
  }, [appointments, dismissedIds]);

  const isLoading = appointmentsLoading || loadingEstablishments;

  return (
    <>
      <div className="bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Olá, {userData?.firstName || "Cliente"}!
              </h1>
              <p className="text-slate-500 mt-1">
                Bem-vindo ao seu painel. Aqui estão os seus compromissos.
              </p>
            </div>
            <button
              onClick={onNavigateToSearch}
              className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Novo Agendamento</span>
            </button>
          </header>

          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === "upcoming"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Calendar /> Próximos
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === "history"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <History /> Histórico
              </button>
              <button
                onClick={() => setActiveTab("favorites")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === "favorites"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Heart /> Favoritos
              </button>
            </nav>
          </div>

          <div className="mt-8">
            {activeTab === "upcoming" && (
              <section>
                {isLoading ? (
                  <div className="space-y-4">
                    <AppointmentCardSkeleton />
                    <AppointmentCardSkeleton />
                  </div>
                ) : upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map((app) => (
                      <AppointmentCard
                        key={app.id}
                        appointment={app}
                        establishment={establishments.get(app.establishmentId)}
                        onCancel={handleOpenCancellationFlow}
                        onShowCancellationInfo={handleShowAlert}
                        onDismiss={handleDismiss}
                      />
                    ))}
                  </div>
                ) : (
                  // ALTERAÇÃO: Substituir emoji por ícone
                  <EmptyState
                    message="Você não tem agendamentos futuros."
                    icon={Calendar}
                    actionText="Encontrar um Horário"
                    onAction={onNavigateToSearch}
                  />
                )}
              </section>
            )}

            {activeTab === "history" && (
              <section>
                {isLoading ? (
                  <div className="space-y-4">
                    <AppointmentCardSkeleton />
                    <AppointmentCardSkeleton />
                  </div>
                ) : pastAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {pastAppointments.map((app) => (
                      <AppointmentCard
                        key={app.id}
                        appointment={app}
                        establishment={establishments.get(app.establishmentId)}
                        onCancel={() => {}}
                        onShowCancellationInfo={handleShowAlert}
                        onDismiss={handleDismiss}
                      />
                    ))}
                  </div>
                ) : (
                  // ALTERAÇÃO: Substituir emoji por ícone
                  <EmptyState
                    message="Seu histórico de agendamentos está vazio."
                    icon={History}
                  />
                )}
              </section>
            )}

            {activeTab === "favorites" && (
              <section>
                {favoritesLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <SalonCardSkeleton />
                    <SalonCardSkeleton />
                    <SalonCardSkeleton />
                    <SalonCardSkeleton />
                  </div>
                ) : favoriteSalons.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {favoriteSalons.map((salon) => (
                      <SalonCard
                        key={salon.id}
                        salon={salon}
                        isFavorite={true}
                        onToggleFavorite={handleUnfavorite}
                      />
                    ))}
                  </div>
                ) : (
                  // ALTERAÇÃO: Substituir emoji por ícone
                  <EmptyState
                    message="Você ainda não favoritou nenhum estabelecimento."
                    icon={Heart}
                    actionText="Encontrar Estabelecimentos"
                    onAction={onNavigateToSearch}
                  />
                )}
              </section>
            )}
          </div>
        </div>
      </div>

      <CancellationInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        onConfirm={() => {
          setInfoModalOpen(false);
          setConfirmModalOpen(true);
        }}
      />
      <RefundConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmCancellation}
        isLoading={isCancelling}
      />
      <AlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        title={alertModalContent.title}
        message={alertModalContent.message}
      />
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title={successModalContent.title}
        message={successModalContent.message}
      />
    </>
  );
}
