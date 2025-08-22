"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useAppointments } from "../../hooks/useAppointments";
import { db, functions } from "../../lib/firebaseConfig";
import { httpsCallable } from "firebase/functions";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Establishment, Appointment } from "../../types";
import EmptyState from "../owner/common/EmptyState";
import LoadingSpinner from "../owner/common/LoadingSpinner";
import AppointmentCard from "./AppointmentCard";
import SalonCard from "./SalonCard";
import { Plus } from "lucide-react";

// Importe os novos modais que criámos
import CancellationInfoModal from "../shared/modals/CancellationInfoModal";
import RefundConfirmationModal from "../shared/modals/RefundConfirmationModal";

interface Props {
  onNavigateToSearch: () => void;
}

export default function ClientDashboardView({ onNavigateToSearch }: Props) {
  const { userData } = useAuth();
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
  const [loading, setLoading] = useState(true);

  // --- NOVOS ESTADOS PARA CONTROLAR O FLUXO DE CANCELAMENTO ---
  const [isInfoModalOpen, setInfoModalOpen] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<Appointment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (appointmentsLoading) return;

    const fetchEstablishmentDetails = async () => {
      if (appointments.length === 0) {
        setLoading(false);
        return;
      }
      const establishmentIds = [
        ...new Set(appointments.map((a) => a.establishmentId)),
      ];
      if (establishmentIds.length === 0) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, "establishments"),
          where("__name__", "in", establishmentIds)
        );
        const querySnapshot = await getDocs(q);
        const establishmentsMap = new Map<string, Establishment>();
        querySnapshot.forEach((doc) => {
          establishmentsMap.set(doc.id, {
            id: doc.id,
            ...doc.data(),
          } as Establishment);
        });
        setEstablishments(establishmentsMap);
      } catch (error) {
        console.error("Erro ao buscar detalhes dos estabelecimentos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstablishmentDetails();
  }, [appointments, appointmentsLoading]);

  useEffect(() => {
    if (!userData?.uid) {
      setFavoritesLoading(false);
      return;
    }

    const fetchFavorites = async () => {
      setFavoritesLoading(true);
      try {
        const favoritesQuery = query(
          collection(db, `users/${userData.uid}/favorites`)
        );
        const favSnapshot = await getDocs(favoritesQuery);
        const favoriteIds = favSnapshot.docs.map((doc) => doc.id);

        if (favoriteIds.length === 0) {
          setFavoriteSalons([]);
          return;
        }

        const establishmentsQuery = query(
          collection(db, "establishments"),
          where("__name__", "in", favoriteIds)
        );
        const estSnapshot = await getDocs(establishmentsQuery);
        const salons = estSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Establishment)
        );

        setFavoriteSalons(salons);
      } catch (error) {
        console.error("Erro ao buscar favoritos:", error);
      } finally {
        setFavoritesLoading(false);
      }
    };

    fetchFavorites();
  }, [userData]);

  // --- LÓGICA DE CANCELAMENTO TOTALMENTE SUBSTITUÍDA ---

  // Função para iniciar o fluxo ao clicar em "Cancelar"
  const handleOpenCancellationFlow = (appointment: Appointment) => {
    setAppointmentToCancel(appointment);
    setInfoModalOpen(true);
  };

  // Função chamada pelo modal final para contactar o backend
  const handleConfirmCancellation = async () => {
    if (!appointmentToCancel) return;

    setIsCancelling(true);
    try {
      const requestFn = httpsCallable(
        functions,
        "requestAppointmentCancellation"
      );
      await requestFn({
        appointmentId: appointmentToCancel.id,
        establishmentId: appointmentToCancel.establishmentId,
        acceptedPartialRefund: true,
      });
      alert(
        "A sua solicitação de cancelamento foi enviada ao estabelecimento!"
      );
      setConfirmModalOpen(false);
      refreshAppointments(); // Atualiza a lista de agendamentos
    } catch (error: any) {
      console.error("Erro ao chamar a função de cancelamento:", error);
      alert(`Ocorreu um erro: ${error.message}`);
    } finally {
      setIsCancelling(false);
      setAppointmentToCancel(null);
    }
  };

  const upcomingAppointments = appointments.filter(
    (a) =>
      !a.cancellationRequest &&
      a.status === "confirmado" &&
      a.dateTime.toDate() > new Date()
  );

  const pastAppointments = appointments.filter(
    (a) =>
      a.cancellationRequest ||
      a.status !== "confirmado" ||
      a.dateTime.toDate() < new Date()
  );

  if (loading || appointmentsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className="space-y-12">
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                Meus Agendamentos
              </h2>
              <p className="text-slate-500 mt-1">
                Aqui estão os seus próximos compromissos.
              </p>
            </div>
            <button
              onClick={onNavigateToSearch}
              className="w-full sm:w-auto px-5 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Novo Agendamento</span>
            </button>
          </div>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((app) => (
                <AppointmentCard
                  key={app.id}
                  appointment={app}
                  establishment={establishments.get(app.establishmentId)}
                  onCancel={handleOpenCancellationFlow}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              message="Você não tem agendamentos futuros."
              icon="📅"
              actionText="Encontrar um Horário"
              onAction={onNavigateToSearch}
            />
          )}
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Histórico</h2>
          {pastAppointments.length > 0 ? (
            <div className="space-y-4">
              {pastAppointments.map((app) => (
                <AppointmentCard
                  key={app.id}
                  appointment={app}
                  establishment={establishments.get(app.establishmentId)}
                  onCancel={() => {}} // Sem ação de cancelar para histórico
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">
                Seu histórico de agendamentos aparecerá aqui.
              </p>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Seus Favoritos
          </h2>
          {favoritesLoading ? (
            <LoadingSpinner />
          ) : favoriteSalons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteSalons.map((salon) => (
                <SalonCard
                  key={salon.id}
                  salon={salon}
                  isFavorite={true}
                  onToggleFavorite={() => {
                    alert("Para desfavoritar, visite a página de busca.");
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              message="Você ainda não favoritou nenhum estabelecimento."
              icon="❤️"
              actionText="Encontrar Estabelecimentos"
              onAction={onNavigateToSearch}
            />
          )}
        </section>
      </div>

      {/* Renderização dos novos modais */}
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
    </>
  );
}
