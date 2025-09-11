// src/components/client/AppointmentCard.tsx

// src/components/client/AppointmentCard.tsx

"use client";

// src/components/client/AppointmentCard.tsx

"use client";

import React from "react";
import Image from "next/image";
import { format, differenceInHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment, Establishment } from "@/types";
import {
  Calendar,
  Clock,
  Map,
  Phone,
  Hourglass,
  CheckCircle,
  X,
  CalendarPlus,
} from "lucide-react"; // Adicionado CalendarPlus

// =================================================================
// ===== ALTERAÇÃO 1: FUNÇÃO PARA GERAR O LINK DO GOOGLE CALENDAR ====
// =================================================================
const generateGoogleCalendarLink = (
  appointment: Appointment,
  establishment?: Establishment
) => {
  if (!appointment.dateTime) return "#";

  const startTime = appointment.dateTime.toDate();
  const endTime = new Date(startTime.getTime() + appointment.duration * 60000); // Adiciona a duração em milissegundos

  // Formata as datas para o formato UTC que o Google Calendar espera (YYYYMMDDTHHMMSSZ)
  const formatGoogleDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d{3}/g, "");
  };

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Agendamento: ${appointment.serviceName} em ${
      establishment?.name || ""
    }`,
    dates: `${formatGoogleDate(startTime)}/${formatGoogleDate(endTime)}`,
    details: `Seu agendamento para ${appointment.serviceName} com ${appointment.professionalfirstName}.`,
    location: establishment?.address || "",
  });

  return `https://www.google.com/calendar/render?${params.toString()}`;
};

interface AppointmentCardProps {
  appointment: Appointment;
  establishment?: Establishment;
  onCancel: (appointment: Appointment) => void;
  onShowCancellationInfo: (title: string, message: string) => void;
  onDismiss: (appointmentId: string) => void;
}

export default function AppointmentCard({
  appointment,
  establishment,
  onCancel,
  onShowCancellationInfo,
  onDismiss,
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

  let virtualStatus:
    | "confirmado"
    | "concluido"
    | "cancelado"
    | "pending_payment" = appointment.status;
  if (appointment.status === "confirmado" && appointmentDate < now) {
    virtualStatus = "concluido";
  }

  const isUpcoming = virtualStatus === "confirmado";
  const hoursUntil = differenceInHours(appointmentDate, now);
  const isCancellable = isUpcoming && hoursUntil >= 3;

  const mapsUrl = establishment?.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        establishment.address
      )}`
    : "#";

  let statusBadge = null;
  if (virtualStatus === "cancelado") {
    let text = "CANCELADO";
    if (appointment.cancellationReason?.includes("Pagamento")) {
      text = "CANCELADO - PAGAMENTO RECUSADO";
    } else if (appointment.cancelledBy === "owner") {
      text = "CANCELADO - PELO ESTABELECIMENTO";
    } else if (appointment.cancelledBy === "client") {
      text = "CANCELADO - POR VOCÊ";
    }
    statusBadge = (
      <span className="text-[10px] sm:text-xs font-bold text-white bg-red-500 px-2 py-1 rounded-full ml-2 shrink-0 text-center">
        {text}
      </span>
    );
  } else if (virtualStatus === "concluido") {
    statusBadge = (
      <span className="text-[10px] sm:text-xs font-bold text-white bg-emerald-500 px-2 py-1 rounded-full ml-2 shrink-0 flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        CONCLUÍDO
      </span>
    );
  }

  // ===== ALTERAÇÃO 4: ESTILO "APAGADO" PARA HISTÓRICO =====
  const cardBorderStyle =
    virtualStatus === "cancelado" || virtualStatus === "concluido"
      ? "border-gray-300 opacity-70"
      : "border-teal-500";

  return (
    <div
      className={`relative bg-white rounded-xl shadow-md p-3 sm:p-5 border-l-4 ${cardBorderStyle} flex flex-col sm:flex-row gap-3 sm:gap-5`}
    >
      {(virtualStatus === "concluido" || virtualStatus === "cancelado") && (
        <button
          onClick={() => onDismiss(appointment.id)}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition z-10"
          aria-label="Dispensar agendamento"
        >
          <X className="w-4 h-4" />
        </button>
      )}

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
            {statusBadge}
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
          {/* ================================================================= */}
          {/* ===== ALTERAÇÃO AQUI: DURAÇÃO ADICIONADA ======================== */}
          {/* ================================================================= */}
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              {format(appointmentDate, "HH:mm")} ({appointment.duration} min)
            </span>
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
          {isUpcoming && (
            <a
              href={generateGoogleCalendarLink(appointment, establishment)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-teal-700 hover:text-teal-800"
            >
              <CalendarPlus className="w-4 h-4 shrink-0" />
              <span className="text-xs underline decoration-dotted">
                Adicionar à Agenda
              </span>
            </a>
          )}
          {/* ================================================================= */}
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
                  "Não é possível cancelar agendamentos com menos de 3 horas de antecedência."
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
