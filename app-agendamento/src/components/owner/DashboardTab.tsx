"use client";

import React, { useMemo } from "react";
import StatsCard from "./common/StatsCard";
import EmptyState from "./common/EmptyState";
import { timestampUtils } from "../../lib/utils";
import { DayPicker, type SelectSingleEventHandler } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ptBR } from "date-fns/locale";
import { format, isToday, isTomorrow } from "date-fns";
import LoadingSpinner from "./common/LoadingSpinner";
import { Appointment, Penalty } from "@/types";
import {
  Hourglass,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  LucideIcon,
  AlertTriangle,
} from "lucide-react";

const AccountStatusAlert = ({ status }: { status?: string }) => {
  if (status !== "suspended") {
    return null;
  }

  return (
    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg mb-8">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
        <div>
          <h3 className="font-bold text-red-800">Sua Conta está Suspensa</h3>
          <p className="text-sm text-red-700 mt-1">
            Detectámos reembolsos que não foram processados no prazo. Para
            reativar a sua conta, as multas aplicadas serão deduzidas
            automaticamente dos seus próximos pagamentos.
          </p>
        </div>
      </div>
    </div>
  );
};

// CORREÇÃO: Tipo 'DisplayStatus' criado para incluir o status virtual 'concluido'
type DisplayStatus = Appointment["status"] | "concluido";

const AppointmentRow = ({
  appointment,
  onCancel,
}: {
  appointment: Appointment;
  onCancel: (app: Appointment) => void;
}) => {
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

  const now = new Date();
  const isPast = appointment.dateTime.toDate() < now;

  // CORREÇÃO: Lógica de status simplificada para evitar erros de comparação
  let virtualStatus: DisplayStatus = appointment.status;
  if (appointment.status === "confirmado" && isPast) {
    virtualStatus = "concluido";
  }

  const statusInfo: {
    [key: string]: { icon: LucideIcon; color: string; label: string };
  } = {
    confirmado: { icon: Clock, color: "text-blue-600", label: "Confirmado" },
    concluido: {
      icon: CheckCircle,
      color: "text-emerald-600",
      label: "Concluído",
    },
    cancelado: { icon: XCircle, color: "text-red-600", label: "Cancelado" },
    pending_refund: {
      icon: Hourglass,
      color: "text-amber-600",
      label: "Reembolso Pendente",
    },
    refunded: {
      icon: XCircle,
      color: "text-gray-500",
      label: "Reembolsado",
    },
    refund_overdue: {
      icon: AlertTriangle,
      color: "text-red-700",
      label: "REEMBOLSO ATRASADO",
    },
  };

  const currentStatusInfo = statusInfo[virtualStatus] || statusInfo.confirmado;
  const Icon = currentStatusInfo.icon;

  return (
    <div
      className={`p-4 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors ${
        virtualStatus !== "confirmado" ? "bg-slate-50 opacity-80" : "bg-white"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${currentStatusInfo.color} bg-white border`}
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
        {appointment.clientPhone && (
          <a
            href={`tel:${appointment.clientPhone}`}
            className="text-xs text-teal-600 hover:underline"
          >
            {appointment.clientPhone}
          </a>
        )}
      </div>

      <div className="flex items-center justify-end gap-4">
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

        {virtualStatus !== "confirmado" && (
          <p className={`text-sm font-semibold ${currentStatusInfo.color}`}>
            {currentStatusInfo.label}
          </p>
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

interface Props {
  stats: { services: number; professionals: number; today: number };
  icons: { services: LucideIcon; professionals: LucideIcon; today: LucideIcon };
  appointmentsForDate: Appointment[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  loading: boolean;
  onOwnerCancelAppointment: (appointment: Appointment) => void;
  establishmentStatus?: "active" | "suspended";
  pendingFines?: Penalty[];
}

const formatDateTitle = (date: Date): string => {
  if (isToday(date)) return "Hoje";
  if (isTomorrow(date)) return "Amanhã";
  return format(date, "dd 'de' MMMM, yyyy", { locale: ptBR });
};

export default function DashboardTab({
  stats,
  icons,
  appointmentsForDate = [],
  selectedDate,
  onDateChange,
  loading,
  onOwnerCancelAppointment,
  establishmentStatus = "active",
  pendingFines = [],
}: Props) {
  const handleDaySelect: SelectSingleEventHandler = (date) => {
    if (date) onDateChange(date);
  };

  const totalFineAmount = useMemo(() => {
    return pendingFines.reduce((sum, fine) => sum + fine.amount, 0);
  }, [pendingFines]);

  const sortedAppointments = useMemo(() => {
    const now = Date.now();
    const getStatusRank = (app: Appointment) => {
      if (app.status === "pending_payment") return 5;
      if (app.status === "cancelado") return 4;
      if (!app.dateTime || app.dateTime.toMillis() < now) return 3;
      return 2;
    };
    if (!appointmentsForDate) return [];
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
      <AccountStatusAlert status={establishmentStatus} />
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-0 text-slate-500">
          Acompanhe a agenda e os indicadores do seu negócio.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <div className="order-2 lg:order-1">
          <p className="text-teal-600 mb-4">Visão geral do seu negócio</p>
          <div
            className={`grid grid-cols-1 md:grid-cols-${
              totalFineAmount > 0 ? "4" : "3"
            } gap-6`}
          >
            <StatsCard
              title="Serviços Oferecidos"
              value={stats.services.toString()}
              icon={icons.services}
              color="blue"
            />
            <StatsCard
              title="Profissionais Ativos"
              value={stats.professionals.toString()}
              icon={icons.professionals}
              color="purple"
            />
            <StatsCard
              title="Agendamentos Hoje"
              value={stats.today.toString()}
              icon={icons.today}
              color="emerald"
            />
            {totalFineAmount > 0 && (
              <StatsCard
                title="Multas Pendentes"
                value={totalFineAmount.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
                icon={AlertTriangle}
                color="red"
              />
            )}
          </div>
        </div>

        <div className="order-1 lg:order-2 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
              <Calendar className="w-5 h-5 text-teal-600 mr-2" />
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
                  icon={Calendar}
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
    </div>
  );
}
