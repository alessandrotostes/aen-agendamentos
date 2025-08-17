"use client";

import React from "react";
import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment, Establishment } from "@/types";
import { Calendar, Clock, Map } from "lucide-react";

interface AppointmentCardProps {
  appointment: Appointment;
  establishment?: Establishment;
  onCancel: (appointment: Appointment) => void; // Alterado para receber o objeto completo
}

export default function AppointmentCard({
  appointment,
  establishment,
  onCancel,
}: AppointmentCardProps) {
  const isUpcoming =
    appointment.status === "confirmado" &&
    appointment.dateTime.toDate() >= new Date();

  const mapsUrl = establishment?.address
    ? `http://googleusercontent.com/maps/google.com/1{encodeURIComponent(
        establishment.address
      )}`
    : "#";

  // Altera o estilo do card se estiver cancelado
  const cardBorderStyle =
    appointment.status === "cancelado"
      ? "border-red-400 opacity-70"
      : "border-teal-500";

  return (
    <div
      className={`bg-white rounded-xl shadow-md p-5 border-l-4 ${cardBorderStyle} flex flex-col sm:flex-row gap-5`}
    >
      {establishment?.imageURL && (
        <div className="relative w-full sm:w-28 h-28 rounded-lg overflow-hidden shrink-0">
          <Image
            src={establishment.imageURL}
            alt={`Logo de ${establishment.name}`}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="flex-grow space-y-3">
        <div>
          <div className="flex justify-between items-start">
            <p className="text-xl font-bold text-slate-900">
              {appointment.serviceName}
            </p>
            {appointment.status === "cancelado" && (
              <span className="text-xs font-bold text-white bg-red-500 px-2 py-1 rounded-full">
                CANCELADO
              </span>
            )}
          </div>
          <p className="text-md text-slate-600 mt-1">
            com{" "}
            <span className="font-semibold">
              {appointment.professionalName}
            </span>
          </p>
          <p className="text-sm text-slate-500 mt-1">
            em{" "}
            <span className="font-semibold">
              {establishment?.name || "..."}
            </span>
          </p>
        </div>

        <div className="border-t border-slate-200"></div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-md text-slate-800">
            <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              {format(appointment.dateTime.toDate(), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </span>
            <span className="text-slate-400">às</span>
            <Clock className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{format(appointment.dateTime.toDate(), "HH:mm")}</span>
          </div>

          {establishment?.address && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-teal-700 transition group"
            >
              <Map className="w-4 h-4 shrink-0" />
              <span className="underline decoration-teal-300 decoration-dotted group-hover:decoration-solid group-hover:decoration-teal-700">
                {establishment.address}
              </span>
            </a>
          )}
        </div>
      </div>

      {isUpcoming && (
        <div className="pt-4 sm:pt-0 sm:ml-auto flex items-center self-start">
          <button
            onClick={() => onCancel(appointment)} // Passa o objeto de agendamento completo
            className="px-4 py-2 text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 transition"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
