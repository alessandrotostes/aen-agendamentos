"use client";

import React from "react";
import Image from "next/image";
import { format, differenceInHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment, Establishment } from "@/types";
import { Calendar, Clock, Map, Phone } from "lucide-react";

interface AppointmentCardProps {
  appointment: Appointment;
  establishment?: Establishment;
<<<<<<< HEAD
  onCancel: (appointment: Appointment) => void;
  onShowCancellationInfo: (title: string, message: string) => void;
=======
  onCancel: (appointment: Appointment) => void; // Alterado para receber o objeto completo
>>>>>>> parent of fab462e (feat: aprimorar componentes de UI e adicionar novos modais para cancelamento e reembolso)
}

export default function AppointmentCard({
  appointment,
  establishment,
  onCancel,
  onShowCancellationInfo,
}: AppointmentCardProps) {
  const now = new Date();
  const appointmentDate = appointment.dateTime.toDate();

  const isUpcoming =
    appointment.status === "confirmado" && appointmentDate >= now;

  const hoursUntil = differenceInHours(appointmentDate, now);
  const isCancellable = isUpcoming && hoursUntil >= 3;

  const mapsUrl = establishment?.address
<<<<<<< HEAD
    ? `https://maps.google.com/?q=${encodeURIComponent(establishment.address)}`
    : "#";

  let cancellationText = "CANCELADO";
  if (appointment.status === "cancelado") {
    if (appointment.cancelledBy === "owner") {
      cancellationText = "CANCELADO PELO ESTABELECIMENTO";
    } else if (appointment.cancelledBy === "client") {
      cancellationText = "CANCELADO POR VOCÊ";
    }
  }

=======
    ? `http://googleusercontent.com/maps/google.com/1{encodeURIComponent(
        establishment.address
      )}`
    : "#";

  // Altera o estilo do card se estiver cancelado
>>>>>>> parent of fab462e (feat: aprimorar componentes de UI e adicionar novos modais para cancelamento e reembolso)
  const cardBorderStyle =
    appointment.status === "cancelado"
      ? "border-red-400 opacity-70"
      : "border-teal-500";

  return (
    <div
      className={`bg-white rounded-xl shadow-md p-5 border-l-4 ${cardBorderStyle} flex flex-col sm:flex-row gap-5`}
    >
      {establishment?.imageURL && (
<<<<<<< HEAD
        <div className="relative w-full h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden shrink-0 bg-slate-100">
=======
        <div className="relative w-full sm:w-28 h-28 rounded-lg overflow-hidden shrink-0">
>>>>>>> parent of fab462e (feat: aprimorar componentes de UI e adicionar novos modais para cancelamento e reembolso)
          <Image
            src={establishment.imageURL}
            alt={`Logo de ${establishment.name}`}
            fill
<<<<<<< HEAD
            className="object-contain"
=======
            className="object-cover"
>>>>>>> parent of fab462e (feat: aprimorar componentes de UI e adicionar novos modais para cancelamento e reembolso)
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
<<<<<<< HEAD
              <span className="text-[10px] sm:text-xs font-bold text-white bg-red-500 px-2 py-1 rounded-full ml-2 shrink-0 text-center">
                {cancellationText}
=======
              <span className="text-xs font-bold text-white bg-red-500 px-2 py-1 rounded-full">
                CANCELADO
>>>>>>> parent of fab462e (feat: aprimorar componentes de UI e adicionar novos modais para cancelamento e reembolso)
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

<<<<<<< HEAD
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-800">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{format(appointmentDate, "dd/MM/yy", { locale: ptBR })}</span>
          </div>
          <div className="flex items-center gap-1.5">
=======
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-md text-slate-800">
            <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              {format(appointment.dateTime.toDate(), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </span>
            <span className="text-slate-400">às</span>
>>>>>>> parent of fab462e (feat: aprimorar componentes de UI e adicionar novos modais para cancelamento e reembolso)
            <Clock className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{format(appointmentDate, "HH:mm")}</span>
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
        <div className="pt-4 sm:pt-0 sm:ml-auto flex items-center self-start">
          <button
<<<<<<< HEAD
            onClick={() => {
              if (isCancellable) {
                onCancel(appointment);
              } else {
                onShowCancellationInfo(
                  "Prazo de Cancelamento Expirado",
                  "Não é possível cancelar agendamentos com menos de 3 horas de antecedência. Por favor, entre em contato diretamente com o estabelecimento caso queira continuar com o cancelamento."
                );
              }
            }}
            className={`w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md transition ${
              isCancellable
                ? "text-red-700 bg-red-100 hover:bg-red-200"
                : "text-gray-500 bg-gray-100 cursor-not-allowed"
            }`}
=======
            onClick={() => onCancel(appointment)} // Passa o objeto de agendamento completo
            className="px-4 py-2 text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 transition"
>>>>>>> parent of fab462e (feat: aprimorar componentes de UI e adicionar novos modais para cancelamento e reembolso)
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
