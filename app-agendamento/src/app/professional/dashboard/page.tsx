"use client";

import React, { useState } from "react";
import { ProfessionalRoute } from "../../../components/auth/ProtectedRoute";
import { useAuth } from "../../../contexts/AuthContext";
import { useAppointmentsForProfessional } from "../../../hooks/useAppointments";
// --- MUDANÇA 1: Importamos o tipo 'Appointment' ---
import { Appointment } from "../../../types";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import LoadingSpinner from "../../../components/owner/common/LoadingSpinner";

// --- MUDANÇA 2: Usamos o tipo 'Appointment' em vez de 'any' ---
const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
    <div>
      <p className="font-bold text-gray-800">{appointment.serviceName}</p>
      <p className="text-sm text-gray-600">Cliente: {appointment.clientName}</p>
    </div>
    <div className="text-lg font-semibold text-teal-600">
      {format(appointment.dateTime.toDate(), "HH:mm")}
    </div>
  </div>
);

function ProfessionalDashboardView() {
  const { userData } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { appointments, loading } =
    useAppointmentsForProfessional(selectedDate);

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-sm p-4 border-b">
        <h1 className="text-xl font-semibold text-gray-800">
          Painel do Profissional
        </h1>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Bem-vindo, {userData?.name || "Profissional"}!
        </h2>
        <p className="mt-2 text-gray-600">
          Esta é a sua agenda para o dia{" "}
          {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}.
        </p>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
              </div>
            ) : appointments.length > 0 ? (
              appointments.map((app) => (
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
