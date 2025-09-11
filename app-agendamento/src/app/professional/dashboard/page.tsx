"use client";

import React, { useState, useMemo } from "react";
import { ProfessionalRoute } from "../../../components/auth/ProtectedRoute";
import { useAuth } from "../../../contexts/AuthContext";
import { useAppointmentsForProfessional } from "../../../hooks/useAppointments";
import { Appointment } from "../../../types";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import LoadingSpinner from "../../../components/owner/common/LoadingSpinner";
import { LogOut, Clock, User } from "lucide-react";

// =================================================================
// ===== COMPONENTE AppointmentCard (Refatorado e Modernizado) =====
// =================================================================
const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
  // Card especial para agendamentos pendentes ou sem data
  if (appointment.status === "pending_payment" || !appointment.dateTime) {
    return (
      <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-gray-50 border border-gray-200 opacity-80">
        <div className="flex items-center space-x-4">
          <div className="w-3 h-3 rounded-full flex-shrink-0 bg-gray-400" />
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
  }

  const now = new Date();
  const appointmentDate = appointment.dateTime.toDate();
  let virtualStatus: "confirmado" | "concluido" | "cancelado" =
    appointment.status;
  if (appointment.status === "confirmado" && appointmentDate < now) {
    virtualStatus = "concluido";
  }

  let cancellationText = "Cancelado";
  if (virtualStatus === "cancelado") {
    if (appointment.cancellationReason?.includes("Pagamento")) {
      cancellationText = "Pagamento Recusado";
    } else if (appointment.cancelledBy === "owner") {
      cancellationText = "Pelo Estabelecimento";
    } else if (appointment.cancelledBy === "client") {
      cancellationText = "Pelo Cliente";
    }
  }

  const statusStyles = {
    confirmado: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      indicator: "bg-yellow-500",
      textColor: "text-gray-900",
      lineThrough: "",
    },
    concluido: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      indicator: "bg-emerald-500",
      textColor: "text-gray-500",
      lineThrough: "line-through",
    },
    cancelado: {
      bg: "bg-red-50",
      border: "border-red-200",
      indicator: "bg-red-500",
      textColor: "text-gray-500",
      lineThrough: "line-through",
    },
  };
  const currentStyle = statusStyles[virtualStatus] || statusStyles.cancelado;

  return (
    <div
      className={`flex flex-col sm:flex-row items-start py-4 px-5 rounded-lg transition-all duration-200 hover:shadow-md ${currentStyle.bg} border ${currentStyle.border}`}
    >
      <div
        className={`w-3 h-3 mt-1.5 rounded-full flex-shrink-0 ${currentStyle.indicator}`}
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
          {virtualStatus === "cancelado" && (
            <span className="ml-2 mt-1 inline-block bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0">
              {cancellationText}
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

// =================================================================
// ===== COMPONENTE PRINCIPAL DA VIEW (Refatorado) =================
// =================================================================
function ProfessionalDashboardView() {
  const { userData, logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { appointments, loading } =
    useAppointmentsForProfessional(selectedDate);

  const sortedAppointments = useMemo(() => {
    const now = Date.now();
    const getStatusRank = (app: Appointment) => {
      if (!app.dateTime) return 4;
      if (app.status === "cancelado") return 3;
      if (app.dateTime.toMillis() < now) return 2;
      return 1;
    };
    return [...appointments].sort((a, b) => {
      const rankA = getStatusRank(a);
      const rankB = getStatusRank(b);
      if (rankA !== rankB) return rankA - rankB;
      if (!a.dateTime || !b.dateTime) return 0;
      return a.dateTime.toMillis() - b.dateTime.toMillis();
    });
  }, [appointments]);

  if (!userData && !loading) {
    return <div>Ocorreu um erro ao carregar os dados do utilizador.</div>;
  }

  return (
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
            ) : sortedAppointments.length > 0 ? (
              sortedAppointments.map((app) => (
                <AppointmentCard key={app.id} appointment={app} />
              ))
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
  );
}

export default function ProfessionalDashboardPage() {
  return (
    <ProfessionalRoute>
      <ProfessionalDashboardView />
    </ProfessionalRoute>
  );
}
