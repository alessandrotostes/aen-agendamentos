"use client";

import React from "react";
import StatsCard from "./common/StatsCard";
import EmptyState from "./common/EmptyState";
import { timestampUtils } from "../../lib/utils";
import type { Timestamp } from "firebase/firestore";
import { DayPicker, type SelectSingleEventHandler } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ptBR } from "date-fns/locale";
import { format, isToday, isTomorrow } from "date-fns";
import LoadingSpinner from "./common/LoadingSpinner";

interface Appointment {
  id: string;
  status: "confirmado" | "pendente" | "cancelado";
  serviceName: string;
  clientName: string;
  professionalName: string;
  dateTime: Timestamp;
}

interface Props {
  stats: {
    services: number;
    professionals: number;
    today: number; // Representa a contagem para o dia selecionado
  };
  appointmentsForDate?: Appointment[];
  selectedDate: Date;
  onDateChange: (date: Date) => void; // Ajustado para não aceitar undefined
  loading: boolean;
}

// Função para criar um título dinâmico e amigável para a data
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
}: Props) {
  // Criamos um handler seguro que verifica se a data não é undefined antes de chamar a função do estado.
  // Isso resolve o erro de tipagem entre o DayPicker e o useState do React.
  const handleDaySelect: SelectSingleEventHandler = (date) => {
    if (date) {
      onDateChange(date);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-teal-600 mt-1">Visão geral do seu negócio</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Serviços Ativos"
          value={stats.services}
          icon={<span className="text-xl">✂️</span>}
          color="teal"
        />
        <StatsCard
          title="Profissionais"
          value={stats.professionals}
          icon={<span className="text-xl">👨‍💼</span>}
          color="indigo"
        />
        <StatsCard
          title={`Agenda de ${formatDateTitle(selectedDate)}`}
          value={stats.today}
          icon={<span className="text-xl">📅</span>}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Coluna Principal: Agendamentos */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b flex items-center justify-between">
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
            ) : appointmentsForDate.length > 0 ? (
              <div className="space-y-4">
                {appointmentsForDate.map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`flex items-center justify-between py-3 px-4 rounded-lg transition-shadow ${
                      appointment.status === "confirmado"
                        ? "bg-emerald-50 border border-emerald-200"
                        : "bg-yellow-50 border border-yellow-200"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          appointment.status === "confirmado"
                            ? "bg-emerald-500"
                            : "bg-yellow-500"
                        }`}
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {appointment.serviceName}
                        </p>
                        <p className="text-sm text-teal-600">
                          {appointment.clientName || "Cliente"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {timestampUtils.format(appointment.dateTime, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-sm text-indigo-600">
                        {appointment.professionalName}
                      </p>
                    </div>
                  </div>
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

        {/* Coluna Lateral: Calendário */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-2 sm:p-4">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDaySelect}
              locale={ptBR}
              className="flex justify-center"
              modifiersClassNames={{
                selected:
                  "bg-teal-500 text-white hover:bg-teal-500 focus:bg-teal-500",
                today: "text-teal-600 font-bold",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
