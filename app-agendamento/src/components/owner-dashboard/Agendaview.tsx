"use client";

import React from "react";
import { DayPicker } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import { Appointment } from "@/types"; // Alterado de AppointmentWithDetails para Appointment

interface AgendaViewProps {
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  appointments: Appointment[]; // Alterado de AppointmentWithDetails para Appointment
  onCancelAppointment: (appointmentId: string) => void;
}

export default function AgendaView({
  selectedDate,
  onDateChange,
  appointments,
  onCancelAppointment,
}: AgendaViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow p-4 flex justify-center">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={onDateChange}
            locale={ptBR}
          />
        </div>
      </div>
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800">
            Agenda do dia:{" "}
            {selectedDate ? format(selectedDate, "dd/MM/yyyy") : ""}
          </h2>
          <div className="mt-4 space-y-4">
            {appointments.length > 0 ? (
              appointments.map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-lg border border-gray-200 bg-gray-50 flex justify-between items-start"
                >
                  <div>
                    <p className="text-lg font-bold text-teal-600">
                      {format(app.dateTime.toDate(), "HH:mm")}
                    </p>
                    <p className="font-semibold text-gray-800">
                      {app.serviceName}
                    </p>
                    <div className="text-sm text-gray-600 mt-2">
                      <p>Cliente: {app.clientName}</p>
                      <p>Profissional: {app.professionalName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onCancelAppointment(app.id)}
                    className="text-sm font-medium text-red-500 hover:text-red-700"
                  >
                    Cancelar
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                Nenhum agendamento para este dia.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
