// src/components/client/AppointmentCard.tsx

"use client";

import React from "react";
import Image from "next/image";
import { format, differenceInHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment, Establishment } from "@/types";
import { Calendar, Clock, Map, Phone, Hourglass } from "lucide-react";

interface AppointmentCardProps {
  appointment: Appointment;
  establishment?: Establishment;
  onCancel: (appointment: Appointment) => void;
  onShowCancellationInfo: (title: string, message: string) => void;
}

export default function AppointmentCard({
  appointment,
  establishment,
  onCancel,
  onShowCancellationInfo,
}: AppointmentCardProps) {
  // =================================================================
  // ===== LÓGICA ATUALIZADA AQUI =====================================
  // =================================================================
  // Se o status for 'pending_payment', renderiza um card especial.
  if (appointment.status === "pending_payment") {
    return (
      <div className="bg-white rounded-xl shadow-md p-3 sm:p-5 border-l-4 border-yellow-400 flex flex-col sm:flex-row gap-3 sm:gap-5">
        {establishment?.imageURL && (
          <div className="relative w-full h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden shrink-0 bg-slate-100">
            <Image
              src={establishment.imageURL}
              alt={`Logo de ${establishment.name}`}
              fill
              sizes="(max-width: 640px) 100vw, 112px"
              className="object-contain"
            />
          </div>
        )}
        <div className="flex-grow flex flex-col justify-center space-y-2">
          <div>
            <p className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
              {appointment.serviceName}
            </p>
            <p className="text-sm sm:text-base text-slate-600">
              com{" "}
              <span className="font-semibold">
                {appointment.professionalfirstName}
              </span>
            </p>
          </div>
          <div className="border-t border-slate-100 !my-2"></div>
          <div className="flex items-center gap-2 text-yellow-700">
            <Hourglass className="w-4 h-4" />
            <p className="text-sm font-semibold">Aguardando seu pagamento</p>
          </div>
        </div>
      </div>
    );
  }
  // =================================================================

  // Se o agendamento não tiver data (ex: um erro), não renderiza nada.
  if (!appointment.dateTime) {
    return null;
  }

  const now = new Date();
  const appointmentDate = appointment.dateTime.toDate();

  const isUpcoming =
    appointment.status === "confirmado" && appointmentDate >= now;

  const hoursUntil = differenceInHours(appointmentDate, now);
  const isCancellable = isUpcoming && hoursUntil >= 3;

  const mapsUrl = establishment?.address
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
            sizes="(max-width: 640px) 100vw, 112px"
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
              <span className="text-[10px] sm:text-xs font-bold text-white bg-red-500 px-2 py-1 rounded-full ml-2 shrink-0 text-center">
                {cancellationText}
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base text-slate-600">
            com{" "}
            <span className="font-semibold">
              {appointment.professionalfirstName}
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
            <span>{format(appointmentDate, "dd/MM/yy", { locale: ptBR })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{format(appointmentDate, "HH:mm")}</span>
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
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
