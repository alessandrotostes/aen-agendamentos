"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { useAppointments } from "../../hooks/useAppointments"; // Usando nosso novo hook!
import SalonCard from "./SalonCard"; // Reutilizando o SalonCard para favoritos
import EmptyState from "../owner/common/EmptyState"; // Reutilizando componente
import LoadingSpinner from "../owner/common/LoadingSpinner";

interface Props {
  onNavigateToSearch: () => void;
}

export default function ClientDashboardView({ onNavigateToSearch }: Props) {
  const { userData } = useAuth();
  const { appointments, loading } = useAppointments(); // O hook já traz os agendamentos do cliente logado

  const upcomingAppointments = appointments.filter(
    (a) => a.status === "confirmado" && a.dateTime.toDate() > new Date()
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-12">
      <section>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold text-gray-900">
            Meus Agendamentos
          </h2>
          <button
            onClick={onNavigateToSearch}
            className="w-full sm:w-auto px-5 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
          >
            <span>Novo Agendamento</span>
          </button>
        </div>

        {upcomingAppointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Aqui listaremos os cards de agendamento no futuro */}
            {upcomingAppointments.map((app) => (
              <div key={app.id} className="bg-white p-4 rounded-lg shadow">
                <p className="font-bold">{app.serviceName}</p>
                <p className="text-sm text-gray-600">
                  em {app.establishmentId}
                </p>{" "}
                {/* Precisaremos buscar o nome do estabelecimento */}
              </div>
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
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Seus Favoritos
        </h2>
        <EmptyState
          message="A funcionalidade de favoritos será implementada em breve."
          icon="❤️"
        />
      </section>
    </div>
  );
}
