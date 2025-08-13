"use client";

import React from "react";
import StatsCard from "./common/StatsCard";
import EmptyState from "./common/EmptyState";
import { timestampUtils } from "../../lib/utils";
import type { Timestamp } from "firebase/firestore";

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
    today: number;
  };
  todayAppointments?: Appointment[];
  confirmedTodayCount?: number;
}

export default function DashboardTab({
  stats,
  todayAppointments = [],
  confirmedTodayCount = 0,
}: Props) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-teal-600 mt-1">Visão geral do seu negócio</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Última atualização</p>
          <p className="text-sm font-medium text-teal-600">
            {new Date().toLocaleDateString("pt-BR")}
          </p>
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
          icon={<span className="text-xl">👨💼</span>}
          color="indigo"
        />
        <StatsCard
          title="Agendamentos Hoje"
          value={stats.today}
          icon={<span className="text-xl">📅</span>}
          color="emerald"
        />
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-teal-100">
        <div className="px-6 py-4 border-b border-teal-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="text-teal-600 mr-2">📅</span> Agendamentos de Hoje
          </h3>
          <div className="text-sm text-teal-600 font-medium">
            {confirmedTodayCount} de {stats.today} confirmados
          </div>
        </div>
        <div className="p-6">
          {todayAppointments.length > 0 ? (
            <div className="space-y-4">
              {todayAppointments.slice(0, 5).map((appointment) => (
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
                        {appointment.clientName}
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
            <EmptyState message="Nenhum agendamento para hoje." icon="📅" />
          )}
        </div>
      </div>
    </div>
  );
}
