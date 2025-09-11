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
  MapPin,
  Phone,
  Hourglass,
  CheckCircle,
  X,
  CalendarPlus,
  Building,
  User,
} from "lucide-react";

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
  if (appointment.status === "pending_payment") {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-amber-400 flex items-center gap-4">
        <div className="w-16 h-16 bg-amber-50 rounded-lg flex items-center justify-center">
          <Hourglass className="w-8 h-8 text-amber-500" />
        </div>
        <div className="flex-grow">
          <p className="font-bold text-slate-800">{appointment.serviceName}</p>
          <p className="text-sm text-slate-500">
            com {appointment.professionalfirstName}
          </p>
          <p className="text-sm font-semibold text-amber-600 mt-1">
            Aguardando seu pagamento
          </p>
        </div>
      </div>
    );
  }

  if (!appointment.dateTime) return null;

  const now = new Date();
  const appointmentDate = appointment.dateTime.toDate();

  let virtualStatus: "confirmado" | "concluido" | "cancelado" =
    appointment.status;
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

  const statusConfig = {
    confirmado: {
      borderColor: "border-teal-500",
      bgColor: "bg-white",
      opacity: "opacity-100",
    },
    concluido: {
      borderColor: "border-gray-300",
      bgColor: "bg-slate-50",
      opacity: "opacity-70",
    },
    cancelado: {
      borderColor: "border-gray-300",
      bgColor: "bg-slate-50",
      opacity: "opacity-70",
    },
  };
  const currentStyle = statusConfig[virtualStatus];

  let statusBadge = null;
  if (virtualStatus === "cancelado") {
    let text = "CANCELADO";
    if (appointment.cancellationReason?.includes("Pagamento"))
      text = "PAGAMENTO RECUSADO";
    else if (appointment.cancelledBy === "owner") text = "PELO ESTABELECIMENTO";
    else if (appointment.cancelledBy === "client") text = "POR VOCÊ";
    statusBadge = (
      <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-1 rounded-full">
        {text}
      </span>
    );
  } else if (virtualStatus === "concluido") {
    statusBadge = (
      <span className="text-[10px] font-bold text-white bg-emerald-500 px-2 py-1 rounded-full flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        CONCLUÍDO
      </span>
    );
  }

  return (
    <div
      className={`relative ${currentStyle.bgColor} rounded-xl shadow-md p-4 border-l-4 ${currentStyle.borderColor} ${currentStyle.opacity} transition-all`}
    >
      {(virtualStatus === "concluido" || virtualStatus === "cancelado") && (
        <button
          onClick={() => onDismiss(appointment.id)}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full z-10"
          aria-label="Dispensar"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        {establishment?.imageURL && (
          <div className="relative w-full h-24 sm:w-28 sm:h-28 shrink-0 rounded-lg overflow-hidden bg-slate-100">
            <Image
              src={establishment.imageURL}
              alt={`Logo de ${establishment.name ?? "Estabelecimento"}`}
              fill
              className="object-contain"
              sizes="112px"
            />
          </div>
        )}

        <div className="flex-grow">
          <header className="flex justify-between items-start mb-3">
            <div>
              <p className="text-lg font-bold text-slate-900">
                {appointment.serviceName}
              </p>
              <p className="text-sm text-slate-500">
                em{" "}
                <span className="font-semibold">
                  {establishment?.name || "..."}
                </span>
              </p>
            </div>
            {statusBadge}
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-700 pt-3 border-t">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{appointment.professionalfirstName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                {format(appointmentDate, "dd/MM/yy", { locale: ptBR })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{establishment?.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                {format(appointmentDate, "HH:mm")} ({appointment.duration} min)
              </span>
            </div>
          </div>

          <footer className="flex justify-around items-center gap-2 sm:gap-4 mt-4 pt-3 border-t flex-wrap">
            {isUpcoming && (
              <>
                {establishment?.address && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors"
                  >
                    <MapPin className="w-4 h-4" /> VER ENDEREÇO
                  </a>
                )}
                {establishment?.phone && (
                  <a
                    href={`tel:${establishment.phone}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors"
                  >
                    <Phone className="w-4 h-4" /> LIGAR
                  </a>
                )}
                <a
                  href={generateGoogleCalendarLink(appointment, establishment)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors"
                >
                  <CalendarPlus className="w-4 h-4" /> AGENDA
                </a>
                <button
                  onClick={() => {
                    if (isCancellable) {
                      onCancel(appointment);
                    } else {
                      onShowCancellationInfo(
                        "Prazo Expirado",
                        "Não é possível cancelar com menos de 3 horas de antecedência."
                      );
                    }
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                    isCancellable
                      ? "text-red-700 bg-red-100 hover:bg-red-200"
                      : "text-gray-500 bg-gray-100 cursor-not-allowed"
                  }`}
                >
                  CANCELAR
                </button>
              </>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
}
