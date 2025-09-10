"use client";

import React, { useMemo } from "react"; // Adicionado useMemo
import StatsCard from "./common/StatsCard";
import EmptyState from "./common/EmptyState";
import { timestampUtils } from "../../lib/utils";
import { DayPicker, type SelectSingleEventHandler } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ptBR } from "date-fns/locale";
import { format, isToday, isTomorrow } from "date-fns";
import LoadingSpinner from "./common/LoadingSpinner";
import { Appointment } from "@/types";
import { Hourglass } from "lucide-react";

interface Props {
  stats: {
    services: number;
    professionals: number;
    today: number;
  };
  appointmentsForDate?: Appointment[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  loading: boolean;
  onOwnerCancelAppointment: (appointment: Appointment) => void;
}

const formatDateTitle = (date: Date): string => {
  if (isToday(date)) {
    return "Hoje";
  }
  if (isTomorrow(date)) {
    return "Amanhã";
  }
  return format(date, "dd 'de' MMMM, yyyy", { locale: ptBR });
};

export default function DashboardTab({
  stats,
  appointmentsForDate = [],
  selectedDate,
  onDateChange,
  loading,
  onOwnerCancelAppointment,
}: Props) {
  const handleDaySelect: SelectSingleEventHandler = (date) => {
    if (date) {
      onDateChange(date);
    }
  };

  // =================================================================
  // ===== ALTERAÇÃO 1: LÓGICA DE ORDENAÇÃO AVANÇADA ==================
  // =================================================================
  const sortedAppointments = useMemo(() => {
    const now = Date.now();

    const getStatusRank = (app: Appointment) => {
      if (app.status === "pending_payment") return 4; // Pendentes por último
      if (app.status === "cancelado") return 3; // Cancelados
      if (!app.dateTime || app.dateTime.toMillis() < now) return 2; // Concluídos
      return 1; // Próximos (Confirmados)
    };

    return [...appointmentsForDate].sort((a, b) => {
      const rankA = getStatusRank(a);
      const rankB = getStatusRank(b);

      if (rankA !== rankB) return rankA - rankB;

      if (!a.dateTime || !b.dateTime) return 0; // Se ambos não tiverem data, não muda a ordem

      return a.dateTime.toMillis() - b.dateTime.toMillis();
    });
  }, [appointmentsForDate]);
  // =================================================================

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="text-teal-600 mr-2">📅</span>
              Agendamentos de {formatDateTitle(selectedDate)}
            </h3>
          </div>
          <div className="p-6 min-h-[200px]">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <LoadingSpinner />
              </div>
            ) : sortedAppointments.length > 0 ? (
              <div className="space-y-4">
                {sortedAppointments.map((appointment) => {
                  // =================================================================
                  // ===== ALTERAÇÃO 2: LÓGICA DE STATUS E RENDERIZAÇÃO =========
                  // =================================================================
                  if (appointment.status === "pending_payment") {
                    return (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between py-3 px-4 rounded-lg bg-yellow-50 border border-yellow-200"
                      >
                        <div className="flex items-center space-x-4">
                          <Hourglass className="w-5 h-5 text-yellow-600 shrink-0" />
                          <div>
                            <p className="font-medium text-gray-800">
                              {appointment.serviceName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {`${appointment.clientFirstName} ${appointment.clientLastName}`.trim() ||
                                "Cliente"}
                            </p>
                            <p className="text-sm font-semibold text-yellow-700 mt-1">
                              Aguardando pagamento do cliente
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const isPast = appointment.dateTime.toDate() < new Date();
                  const virtualStatus =
                    appointment.status === "cancelado"
                      ? "cancelado"
                      : isPast
                      ? "concluido"
                      : "confirmado";

                  const statusStyles = {
                    confirmado: {
                      bg: "bg-amber-50",
                      border: "border-amber-200",
                      indicator: "bg-amber-500",
                      badge: "bg-amber-100 text-amber-800",
                      text: "Confirmado",
                    },
                    concluido: {
                      bg: "bg-emerald-50",
                      border: "border-emerald-200",
                      indicator: "bg-emerald-500",
                      badge: "bg-emerald-100 text-emerald-800",
                      text: "Concluído",
                    },
                    cancelado: {
                      bg: "bg-red-50",
                      border: "border-red-200",
                      indicator: "bg-red-400",
                      badge: "bg-red-200 text-red-700",
                      text: (() => {
                        if (
                          appointment.cancellationReason?.includes("Pagamento")
                        ) {
                          return "Pagamento Recusado";
                        }
                        if (appointment.cancelledBy === "owner") {
                          return "Cancelado por você";
                        }
                        return "Cancelado pelo Cliente";
                      })(),
                    },
                  };
                  const currentStyle = statusStyles[virtualStatus];

                  return (
                    <div
                      key={appointment.id}
                      className={`flex items-center justify-between py-3 px-1 rounded-lg transition-shadow ${currentStyle.bg} ${currentStyle.border}`}
                    >
                      <div className="flex items-center space-x-4 ">
                        <div
                          className={`w-3 h-3 rounded-full flex-shrink-0 ${currentStyle.indicator}`}
                        />
                        <div>
                          <p
                            className={`font-medium break-words max-w-[210px] py-1 ${
                              virtualStatus !== "confirmado"
                                ? "text-gray-500 line-through"
                                : "text-gray-900"
                            }`}
                          >
                            {appointment.serviceName}
                          </p>
                          <p className="text-sm text-teal-600 py-1">
                            {`${appointment.clientFirstName} ${appointment.clientLastName}`.trim() ||
                              "Cliente"}
                          </p>
                          <span
                            className={`mt-2 inline-flex items-center text-center px-2 py-1 rounded-full text-xs font-medium ${currentStyle.badge}`}
                          >
                            {currentStyle.text}
                          </span>
                        </div>
                      </div>
                      <div className="text-center ">
                        <p
                          className={`font-semibold px-1 py-1 flexbox ${
                            virtualStatus !== "confirmado"
                              ? "text-gray-500 line-through"
                              : "text-gray-900 "
                          }`}
                        >
                          {timestampUtils.format(appointment.dateTime, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          <span className="ml-1 text-xs font-normal text-gray-500">
                            ({appointment.duration} min)
                          </span>
                        </p>
                        <p className="text-sm text-indigo-500 mt-2 text-center">
                          {appointment.professionalfirstName}
                        </p>
                        {virtualStatus === "confirmado" && (
                          <button
                            onClick={() =>
                              onOwnerCancelAppointment(appointment)
                            }
                            className="text-xs text-red-500 hover:text-red-700 font-medium mt-2 rounded hover:bg-red-200 text-center px-2 py-1 transition "
                          >
                            Cancelar Agendamento
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                message="Nenhum agendamento para este dia."
                icon="🗓️"
              />
            )}
          </div>
        </div>
        <div className="lg:col-span-1 bg-white p-4 rounded-xl shadow-sm border">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDaySelect}
            locale={ptBR}
            className="w-full flex justify-center"
            classNames={{ head_cell: "w-full", table: "w-full", day: "w-full" }}
          />
        </div>
      </div>

      <div>
        <p className="text-teal-600 mb-4">Visão geral do seu negócio</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Serviços Oferecidos"
            value={stats.services.toString()}
            icon="📋"
          />
          <StatsCard
            title="Profissionais Ativos"
            value={stats.professionals.toString()}
            icon="👨‍💼"
          />
          <StatsCard
            title="Agendamentos Hoje"
            value={stats.today.toString()}
            icon="📆"
          />
        </div>
      </div>
    </div>
  );
}
