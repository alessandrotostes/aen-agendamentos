"use client";

import React, { useEffect, useState } from "react";
import { useAppointments } from "../../hooks/useAppointments";
import { db, functions } from "../../lib/firebaseConfig"; // Importe 'functions'
import { httpsCallable } from "firebase/functions"; // Importe 'httpsCallable'
import { collection, query, where, getDocs } from "firebase/firestore";
import { Establishment, Appointment } from "../../types";
import { differenceInHours } from "date-fns";
import EmptyState from "../owner/common/EmptyState";
import LoadingSpinner from "../owner/common/LoadingSpinner";
import AppointmentCard from "./AppointmentCard";
import CancelAppointmentModal from "../shared/modals/CancelAppointmentModal";
import { Plus } from "lucide-react";

interface Props {
  onNavigateToSearch: () => void;
}

export default function ClientDashboardView({ onNavigateToSearch }: Props) {
  const {
    appointments,
    loading: appointmentsLoading,
    refresh: refreshAppointments,
  } = useAppointments();
  const [establishments, setEstablishments] = useState<
    Map<string, Establishment>
  >(new Map());
  const [loading, setLoading] = useState(true);

  // Estados para controlar o modal de cancelamento
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<Appointment | null>(null);

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

  // Lógica de cancelamento com a regra de tempo e o modal
  const handleCancelAppointment = (appointment: Appointment) => {
    const now = new Date();
    const appointmentTime = appointment.dateTime.toDate();

    if (differenceInHours(appointmentTime, now) < 6) {
      alert(
        "O cancelamento deve ser feito com 6 horas de antecedência. Contate o estabelecimento caso ainda queira cancelar seu horário."
      );
      return;
    }

    setAppointmentToCancel(appointment);
    setIsCancelModalOpen(true);
  };

  // --- FUNÇÃO MODIFICADA PARA CHAMAR O BACKEND (FASE B) ---
  const handleConfirmCancellation = async () => {
    if (!appointmentToCancel) return;

    try {
      // Prepara a chamada para a nossa nova Cloud Function
      const cancelFunction = httpsCallable(
        functions,
        "cancelAndRefundAppointment"
      );

      // Chama a função, passando o ID do agendamento
      const result = await cancelFunction({
        appointmentId: appointmentToCancel.id,
      });

      console.log("Resultado da função de cancelamento:", result.data);
      alert("Agendamento cancelado e reembolso iniciado com sucesso!");
      // O 'onSnapshot' do hook useAppointments deve atualizar a UI automaticamente
    } catch (error: unknown) {
      console.error("Erro ao chamar a função de cancelamento:", error);
      // Mostra a mensagem de erro vinda do backend para o usuário
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      alert(`Ocorreu um erro: ${errorMessage}`);
    } finally {
      // Limpa e fecha o modal independentemente do resultado
      setIsCancelModalOpen(false);
      setAppointmentToCancel(null);
    }
  };

  const upcomingAppointments = appointments.filter(
    (a) => a.status === "confirmado" && a.dateTime.toDate() > new Date()
  );

  const pastAppointments = appointments.filter(
    (a) => a.status !== "confirmado" || a.dateTime.toDate() < new Date()
  );

  if (loading) {
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
                  onCancel={handleCancelAppointment}
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
                  onCancel={() => {}} // Não se pode cancelar agendamentos passados
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
          <EmptyState
            message="A funcionalidade de favoritos será implementada em breve."
            icon="❤️"
          />
        </section>
      </div>

      <CancelAppointmentModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancellation}
      />
    </>
  );
}
