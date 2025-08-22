"use client";

import React from "react";
import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment, Establishment } from "@/types";
import { Calendar, Clock, Map, Phone } from "lucide-react"; // <-- Adicionado ícone de Telefone

interface AppointmentCardProps {
  appointment: Appointment;
  establishment?: Establishment;
  onCancel: (appointment: Appointment) => void;
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
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        establishment.address
      )}`
    : "#";

  const cardBorderStyle =
    appointment.status === "cancelado"
      ? "border-red-400 opacity-70"
      : "border-teal-500";

  return (
    <div
      className={`bg-white rounded-xl shadow-md p-3 sm:p-5 border-l-4 ${cardBorderStyle} flex flex-col sm:flex-row gap-3 sm:gap-5`}
    >
      {establishment?.imageURL && (
        <div className="relative w-full h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden shrink-0 bg-slate-100">
          <Image
            src={establishment.imageURL}
            alt={`Logo de ${establishment.name}`}
            fill
            className="object-contain"
          />
        </div>
      )}

      <div className="flex-grow flex flex-col justify-center space-y-2">
        <div>
          <div className="flex justify-between items-start">
            <p className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
              {appointment.serviceName}
            </p>
            {appointment.status === "cancelado" && (
              <span className="text-xs font-bold text-white bg-red-500 px-2 py-1 rounded-full ml-2 shrink-0">
                CANCELADO
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base text-slate-600">
            com{" "}
            <span className="font-semibold">
              {appointment.professionalName}
            </span>
          </p>
          <p className="text-xs sm:text-sm text-slate-500">
            em{" "}
            <span className="font-semibold">
              {establishment?.name || "..."}
            </span>
          </p>
        </div>

        <div className="border-t border-slate-100 !my-2"></div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-800">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              {format(appointment.dateTime.toDate(), "dd/MM/yy", {
                locale: ptBR,
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{format(appointment.dateTime.toDate(), "HH:mm")}</span>
          </div>
          {establishment?.address && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-teal-700 hover:text-teal-800"
            >
              <Map className="w-4 h-4 shrink-0" />
              <span className="text-xs underline decoration-dotted">
                Ver endereço
              </span>
            </a>
          )}
          {/* --- NOVO BLOCO DO TELEFONE ADICIONADO AQUI --- */}
          {establishment?.phone && (
            <a
              href={`tel:${establishment.phone}`}
              className="inline-flex items-center gap-1.5 text-teal-700 hover:text-teal-800"
            >
              <Phone className="w-4 h-4 shrink-0" />
              <span className="text-xs underline decoration-dotted">Ligar</span>
            </a>
          )}
        </div>
      </div>

      {isUpcoming && (
        <div className="border-t sm:border-none pt-3 sm:pt-0 sm:ml-auto flex items-center self-stretch sm:self-center">
          <button
            onClick={() => onCancel(appointment)}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 transition"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
