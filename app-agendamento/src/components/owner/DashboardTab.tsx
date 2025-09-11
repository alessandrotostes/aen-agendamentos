import React, { useMemo } from "react";
import StatsCard from "./common/StatsCard";
import EmptyState from "./common/EmptyState";
import { timestampUtils } from "../../lib/utils";
import { DayPicker, type SelectSingleEventHandler } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ptBR } from "date-fns/locale";
import { format, isToday, isTomorrow } from "date-fns";
import LoadingSpinner from "./common/LoadingSpinner";
import { Appointment } from "@/types";
import { Hourglass, Clock, CheckCircle, XCircle } from "lucide-react";

interface Props {
  stats: { services: number; professionals: number; today: number };
  appointmentsForDate?: Appointment[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  loading: boolean;
  onOwnerCancelAppointment: (appointment: Appointment) => void;
}

const formatDateTitle = (date: Date): string => {
  if (isToday(date)) return "Hoje";
  if (isTomorrow(date)) return "Amanhã";
  return format(date, "dd 'de' MMMM, yyyy", { locale: ptBR });
};
// =================================================================
// ===== NOVO COMPONENTE INTERNO: LINHA DE AGENDAMENTO =============
// =================================================================
const AppointmentRow = ({
  appointment,
  onCancel,
}: {
  appointment: Appointment;
  onCancel: (app: Appointment) => void;
}) => {
  // Se for pendente, exibe um card especial (sem alterações)
  if (appointment.status === "pending_payment") {
    return (
      <div className="flex items-center justify-between p-4 rounded-lg bg-amber-50 border border-amber-200">
        <div className="flex items-center gap-4">
          <Hourglass className="w-6 h-6 text-amber-500 shrink-0" />
          <div>
            <p className="font-semibold text-slate-800">
              {appointment.serviceName}
            </p>
            <p className="text-sm text-slate-500">
              {`${appointment.clientFirstName} ${appointment.clientLastName}`.trim()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-amber-600">
            Aguardando Pagamento
          </p>
        </div>
      </div>
    );
  }

  // Lógica de status para agendamentos com data
  const now = new Date();
  const isPast = appointment.dateTime.toDate() < now;
  const virtualStatus =
    appointment.status === "cancelado"
      ? "cancelado"
      : isPast
      ? "concluido"
      : "confirmado";

  const statusInfo = {
    confirmado: { icon: Clock, color: "text-blue-600" },
    concluido: { icon: CheckCircle, color: "text-emerald-600" },
    cancelado: { icon: XCircle, color: "text-red-600" },
  };

  let cancelText = "Cancelado";
  if (virtualStatus === "cancelado") {
    if (appointment.cancellationReason?.includes("Pagamento"))
      cancelText = "Pagamento Recusado";
    else if (appointment.cancelledBy === "owner")
      cancelText = "Cancelado por Você";
    else cancelText = "Cancelado pelo Cliente";
  }

  const Icon = statusInfo[virtualStatus].icon;

  return (
    <div
      className={`p-4 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors ${
        virtualStatus !== "confirmado" ? "bg-slate-50 opacity-80" : "bg-white"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${statusInfo[virtualStatus].color} bg-white border`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-grow">
          <p className="font-semibold text-slate-800">
            {appointment.serviceName}
          </p>
          <p className="text-sm text-slate-600">
            com {appointment.professionalfirstName}
          </p>
        </div>
      </div>
      <div className="text-sm text-slate-600 sm:text-center">
        <p className="font-semibold text-slate-900">
          {`${appointment.clientFirstName} ${appointment.clientLastName}`.trim()}
        </p>

        {/* ===== EXIBA O TELEMÓVEL DO CLIENTE AQUI ===== */}
        {appointment.clientPhone && (
          <a
            href={`tel:${appointment.clientPhone}`}
            className="text-xs text-teal-600 hover:underline"
          >
            {appointment.clientPhone}
          </a>
        )}
        {/* ========================================== */}
      </div>

      <div className="text-sm text-slate-600 sm:text-center">
        <p className="font-semibold text-slate-900">
          {`${appointment.clientFirstName} ${appointment.clientLastName}`.trim()}
        </p>
      </div>

      <div className="flex items-center justify-end gap-4">
        {/* ================================================================= */}
        {/* ===== CORREÇÃO 1: ALINHAMENTO DO RISCO (line-through) ========= */}
        {/* ================================================================= */}
        <div
          className={`flex items-baseline ${
            virtualStatus !== "confirmado"
              ? "line-through decoration-gray-500"
              : ""
          }`}
        >
          <p
            className={`font-semibold ${
              virtualStatus !== "confirmado" ? "text-gray-500" : "text-gray-900"
            }`}
          >
            {timestampUtils.format(appointment.dateTime, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <span className="ml-2 text-xs font-normal text-gray-500">
            ({appointment.duration} min)
          </span>
        </div>
        {/* ================================================================= */}

        {virtualStatus === "cancelado" && (
          <p className="text-sm font-semibold text-red-600">{cancelText}</p>
        )}
        {virtualStatus === "confirmado" && (
          <button
            onClick={() => onCancel(appointment)}
            className="text-xs text-red-500 hover:text-red-700 font-medium p-1 rounded hover:bg-red-50 transition"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
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
    if (date) onDateChange(date);
  };

  const sortedAppointments = useMemo(() => {
    const now = Date.now();
    const getStatusRank = (app: Appointment) => {
      if (app.status === "pending_payment") return 1;
      if (app.status === "cancelado") return 4;
      if (!app.dateTime || app.dateTime.toMillis() < now) return 3;
      return 2;
    };
    return [...appointmentsForDate].sort((a, b) => {
      const rankA = getStatusRank(a);
      const rankB = getStatusRank(b);
      if (rankA !== rankB) return rankA - rankB;
      if (!a.dateTime || !b.dateTime) return 0;
      return a.dateTime.toMillis() - b.dateTime.toMillis();
    });
  }, [appointmentsForDate]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-0 text-slate-500">
          Acompanhe a agenda e os indicadores do seu negócio.
        </p>
      </div>

      {/* ================================================================= */}
      {/* ===== CORREÇÃO 2: REORDENAÇÃO DAS SECÇÕES ======================= */}
      {/* ================================================================= */}
      <div className="flex flex-col gap-8">
        {/* No mobile: order-2 (segundo), no desktop: lg:order-1 (primeiro) */}
        <div className="order-2 lg:order-1">
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

        {/* No mobile: order-1 (primeiro), no desktop: lg:order-2 (segundo) */}
        <div className="order-1 lg:order-2 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
              <span className="text-teal-600 mr-2">📅</span>
              Agendamentos de {formatDateTitle(selectedDate)}
            </h3>
            <div className="min-h-[200px]">
              {loading ? (
                <div className="flex justify-center items-center h-full pt-10">
                  <LoadingSpinner />
                </div>
              ) : sortedAppointments.length > 0 ? (
                <div className="space-y-3">
                  {sortedAppointments.map((appointment) => (
                    <AppointmentRow
                      key={appointment.id}
                      appointment={appointment}
                      onCancel={onOwnerCancelAppointment}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  message="Nenhum agendamento para este dia."
                  icon="🗓️"
                />
              )}
            </div>
          </div>
          <div className="lg:col-span-1 bg-white p-2 sm:p-4 rounded-xl shadow-sm border">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDaySelect}
              locale={ptBR}
              className="w-full flex justify-center"
            />
          </div>
        </div>
      </div>
      {/* ================================================================= */}
    </div>
  );
}
