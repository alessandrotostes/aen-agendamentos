"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ProfessionalRoute } from "../../../components/auth/ProtectedRoute";
import { useAuth } from "../../../contexts/AuthContext";
import { useAppointmentsForProfessional } from "../../../hooks/useAppointments";
import { Appointment } from "../../../types";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import LoadingSpinner from "../../../components/owner/common/LoadingSpinner";
import {
  LogOut,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Hourglass,
  LucideIcon,
} from "lucide-react";
import TermsAndConditionsModal from "../../../components/shared/modals/TermsAndConditionsModal";

type DisplayStatus = Appointment["status"] | "concluido";

const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
  // A lógica especial para 'pending_payment' é movida para o componente principal
  if (!appointment.dateTime) {
    return null;
  }

  const now = new Date();
  const appointmentDate = appointment.dateTime.toDate();

  let virtualStatus: DisplayStatus = appointment.status;
  if (appointment.status === "confirmado" && appointmentDate < now) {
    virtualStatus = "concluido";
  }

  let statusText = "";
  if (virtualStatus === "cancelado") {
    if (appointment.cancellationReason?.includes("Pagamento"))
      statusText = "Pagamento Recusado";
    else if (appointment.cancelledBy === "owner")
      statusText = "Pelo Estabelecimento";
    else if (appointment.cancelledBy === "client") statusText = "Pelo Cliente";
    else statusText = "Cancelado";
  } else if (virtualStatus === "pending_refund") {
    statusText = "Reembolso Pendente";
  } else if (virtualStatus === "refunded") {
    statusText = "Reembolsado";
  }

  const statusStyles: {
    [key: string]: {
      bg: string;
      border: string;
      indicator: string;
      textColor: string;
      lineThrough: string;
      icon: LucideIcon;
    };
  } = {
    confirmado: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      indicator: "text-yellow-500",
      textColor: "text-gray-900",
      lineThrough: "",
      icon: Clock,
    },
    concluido: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      indicator: "text-emerald-500",
      textColor: "text-gray-500",
      lineThrough: "line-through",
      icon: CheckCircle,
    },
    cancelado: {
      bg: "bg-red-50",
      border: "border-red-200",
      indicator: "text-red-500",
      textColor: "text-gray-500",
      lineThrough: "line-through",
      icon: XCircle,
    },
    pending_refund: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      indicator: "text-amber-500",
      textColor: "text-gray-900",
      lineThrough: "",
      icon: Hourglass,
    },
    refunded: {
      bg: "bg-gray-100",
      border: "border-gray-200",
      indicator: "text-gray-500",
      textColor: "text-gray-500",
      lineThrough: "line-through",
      icon: XCircle,
    },
    refund_overdue: {
      bg: "bg-red-100",
      border: "border-red-300",
      indicator: "text-red-600",
      textColor: "text-gray-900",
      lineThrough: "",
      icon: Clock,
    },
  };
  const currentStyle =
    statusStyles[virtualStatus as keyof typeof statusStyles] ||
    statusStyles.confirmado;
  const Icon = currentStyle.icon;

  return (
    <div
      className={`flex flex-col sm:flex-row items-start py-4 px-5 rounded-lg transition-all duration-200 hover:shadow-md ${currentStyle.bg} border ${currentStyle.border}`}
    >
      <Icon
        className={`w-6 h-6 mt-1 flex-shrink-0 ${currentStyle.indicator}`}
      />
      <div className="flex-1 sm:ml-4 mt-2 sm:mt-0">
        <div className="flex justify-between items-start">
          <div>
            <p className={`font-bold text-lg ${currentStyle.textColor}`}>
              {appointment.serviceName}
            </p>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <User className="w-4 h-4 mr-1.5" />
              <span>
                {`${appointment.clientFirstName} ${appointment.clientLastName}`.trim() ||
                  "Não informado"}
              </span>
            </div>
          </div>
          {statusText && (
            <span
              className={`ml-2 mt-1 inline-block text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${currentStyle.indicator} bg-opacity-10`}
            >
              {statusText}
            </span>
          )}
        </div>
      </div>
      <div
        className={`text-lg font-semibold text-right sm:ml-4 mt-3 sm:mt-0 ${currentStyle.textColor} ${currentStyle.lineThrough}`}
      >
        {format(appointmentDate, "HH:mm")}
        <div className="flex items-center justify-end text-xs font-normal text-gray-500 mt-0.5">
          <Clock className="w-3 h-3 mr-1" />
          <span>{appointment.duration} min</span>
        </div>
      </div>
    </div>
  );
};

// Componente específico para agendamentos pendentes de pagamento
const PendingPaymentCard = ({ appointment }: { appointment: Appointment }) => (
  <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-gray-50 border border-gray-200 opacity-80">
    <div className="flex items-center space-x-4">
      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
        <Hourglass className="w-5 h-5 text-gray-400" />
      </div>
      <div>
        <p className="font-bold truncate text-gray-700">
          {appointment.serviceName}
        </p>
        <p className="text-sm text-gray-500">
          Aguardando confirmação de pagamento do cliente.
        </p>
      </div>
    </div>
  </div>
);

function ProfessionalDashboardView() {
  const { userData, logout, acceptTerms, refreshUserData } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { appointments, loading } =
    useAppointmentsForProfessional(selectedDate);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isAcceptingTerms, setIsAcceptingTerms] = useState(false);

  useEffect(() => {
    if (userData && !userData.termsAccepted) setIsTermsModalOpen(true);
  }, [userData]);

  const handleAcceptTerms = async () => {
    if (!userData) return;
    setIsAcceptingTerms(true);
    try {
      await acceptTerms(userData.uid);
      await refreshUserData();
      setIsTermsModalOpen(false);
    } catch (error) {
      console.error("Erro ao aceitar os termos:", error);
      alert("Ocorreu um erro. Por favor, tente novamente.");
    } finally {
      setIsAcceptingTerms(false);
    }
  };

  // --- LÓGICA DE ORDENAÇÃO ATUALIZADA ---
  const { sortedAppointments, pendingPaymentAppointments } = useMemo(() => {
    // 1. Separa os agendamentos 'pending_payment'
    const pending = appointments.filter(
      (app) => app.status === "pending_payment"
    );
    const others = appointments.filter(
      (app) => app.status !== "pending_payment"
    );

    // 2. Ordena os outros agendamentos
    const sortedOthers = [...others].sort((a, b) => {
      // Ordena por data/hora, do mais próximo para o mais distante
      if (!a.dateTime || !b.dateTime) return 0;
      return a.dateTime.toMillis() - b.dateTime.toMillis();
    });

    return {
      sortedAppointments: sortedOthers,
      pendingPaymentAppointments: pending,
    };
  }, [appointments]);

  if (!userData && !loading) {
    return <div>Ocorreu um erro ao carregar os dados do utilizador.</div>;
  }

  return (
    <>
      <TermsAndConditionsModal
        isOpen={isTermsModalOpen}
        onConfirm={handleAcceptTerms}
        isLoading={isAcceptingTerms}
      />

      <div className="bg-gray-50 min-h-screen">
        <header className="bg-white shadow-sm p-4 border-b flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Painel do Profissional
            </h1>
            <p className="text-sm text-gray-500">
              {userData?.firstName || "Carregando..."}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Bem-vindo, {userData?.firstName || "..."}!
          </h2>
          <p className="mt-2 text-gray-600">
            Sua agenda para{" "}
            <span className="font-semibold text-teal-600">
              {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </span>
            .
          </p>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-4">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <LoadingSpinner />
                </div>
              ) : sortedAppointments.length > 0 ||
                pendingPaymentAppointments.length > 0 ? (
                <>
                  {/* --- RENDERIZAÇÃO ATUALIZADA --- */}
                  {/* 3. Renderiza primeiro a lista principal ordenada */}
                  {sortedAppointments.map((app) => (
                    <AppointmentCard key={app.id} appointment={app} />
                  ))}
                  {/* 4. Renderiza os pendentes de pagamento no final, se existirem */}
                  {pendingPaymentAppointments.length > 0 && (
                    <div className="pt-4 mt-4 border-t">
                      <h3 className="text-sm font-semibold text-gray-500 mb-3">
                        Aguardando Pagamento
                      </h3>
                      <div className="space-y-4">
                        {pendingPaymentAppointments.map((app) => (
                          <PendingPaymentCard key={app.id} appointment={app} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
                  <p className="text-gray-500">
                    Nenhum agendamento para este dia.
                  </p>
                </div>
              )}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-2">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  locale={ptBR}
                  className="flex justify-center"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default function ProfessionalDashboardPage() {
  return (
    <ProfessionalRoute>
      <ProfessionalDashboardView />
    </ProfessionalRoute>
  );
}
