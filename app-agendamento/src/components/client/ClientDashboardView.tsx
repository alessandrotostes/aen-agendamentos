"use client";

import React, { useEffect, useState } from "react";
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
import LoadingSpinner from "../owner/common/LoadingSpinner";
import AppointmentCard from "./AppointmentCard";
import SalonCard from "./SalonCard";
import { Plus } from "lucide-react";

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

  const [isInfoModalOpen, setInfoModalOpen] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<Appointment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (appointmentsLoading || appointments.length === 0) {
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
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao ouvir detalhes dos estabelecimentos:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [appointments, appointmentsLoading]);

  // --- useEffect DE FAVORITOS SUBSTITUÍDO PELA VERSÃO CORRIGIDA ---
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
    try {
      const cancelFn = httpsCallable(functions, "clientCancelAppointment");
      await cancelFn({
        appointmentId: appointmentToCancel.id,
        establishmentId: appointmentToCancel.establishmentId,
      });
      alert("O seu agendamento foi cancelado com sucesso.");
      setConfirmModalOpen(false);
      refreshAppointments();
    } catch (error: any) {
      console.error("Erro ao chamar a função de cancelamento:", error);
      alert(`Ocorreu um erro: ${error.message}`);
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
                  onCancel={() => {}}
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
                  onToggleFavorite={handleUnfavorite}
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
