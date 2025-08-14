"use client";

import { useState } from "react";
import { Timestamp } from "firebase/firestore";
import { Appointment } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { useFirestore } from "./useFirestore"; // ✅ Correto
import { errorUtils, timestampUtils } from "../lib/utils";

// ========== APPOINTMENTS HOOK ==========
export function useAppointments() {
  const { userData } = useAuth();

  // Para owners - ver todos os agendamentos do estabelecimento
  const ownerAppointments = useFirestore<Appointment>("appointments", {
    realtime: true,
    whereConditions:
      userData?.uid && userData.role === "owner"
        ? [{ field: "establishmentId", operator: "==", value: userData.uid }]
        : [],
    orderByField: "dateTime",
    orderDirection: "asc",
  });

  // Para clients - ver apenas seus agendamentos
  const clientAppointments = useFirestore<Appointment>("appointments", {
    realtime: true,
    whereConditions:
      userData?.uid && userData.role === "client"
        ? [{ field: "clientId", operator: "==", value: userData.uid }]
        : [],
    orderByField: "dateTime",
    orderDirection: "desc",
  });

  // Escolher qual usar baseado no role
  const appointments =
    userData?.role === "owner" ? ownerAppointments : clientAppointments;

  return {
    appointments: appointments.data,
    loading: appointments.loading,
    error: appointments.error,
    refresh: appointments.refresh,
  };
}

// ========== TODAY'S APPOINTMENTS HOOK ==========
export function useTodayAppointments() {
  const { userData } = useAuth();

  // Calcular início e fim do dia
  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );

  const {
    data: appointments,
    loading,
    error,
    refresh,
  } = useFirestore<Appointment>("appointments", {
    realtime: true,
    whereConditions:
      userData?.uid && userData.role === "owner"
        ? [
            { field: "establishmentId", operator: "==", value: userData.uid },
            {
              field: "dateTime",
              operator: ">=",
              value: Timestamp.fromDate(startOfDay),
            },
            {
              field: "dateTime",
              operator: "<",
              value: Timestamp.fromDate(endOfDay),
            },
          ]
        : [],
    orderByField: "dateTime",
    orderDirection: "asc",
  });

  return {
    todayAppointments: appointments,
    loading,
    error,
    refresh,
  };
}

// ========== APPOINTMENT UTILITIES ==========
export const appointmentUtils = {
  // Filtrar agendamentos por status
  filterByStatus: (
    appointments: Appointment[],
    status: Appointment["status"]
  ) => {
    return appointments.filter((app) => app.status === status);
  },

  // Filtrar agendamentos de hoje
  filterToday: (appointments: Appointment[]) => {
    return appointments.filter((app) => timestampUtils.isToday(app.dateTime));
  },

  // Agrupar por data
  groupByDate: (appointments: Appointment[]) => {
    const groups: Record<string, Appointment[]> = {};

    appointments.forEach((app) => {
      const dateStr = timestampUtils.format(app.dateTime, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }

      groups[dateStr].push(app);
    });

    return groups;
  },

  // Verificar se horário está disponível
  isTimeSlotAvailable: (
    appointments: Appointment[],
    dateTime: Date,
    duration: number,
    excludeId?: string
  ): boolean => {
    const targetStart = dateTime.getTime();
    const targetEnd = targetStart + duration * 60 * 1000;

    return !appointments.some((app) => {
      if (excludeId && app.id === excludeId) return false;
      if (app.status === "cancelado") return false;

      const appStart = app.dateTime.toDate().getTime();
      const appEnd = appStart + app.duration * 60 * 1000;

      // Verificar sobreposição
      return targetStart < appEnd && targetEnd > appStart;
    });
  },

  // Calcular próximos horários disponíveis
  getAvailableTimeSlots: (
    appointments: Appointment[],
    date: Date,
    duration: number,
    startHour = 8,
    endHour = 18,
    intervalMinutes = 30
  ): Date[] => {
    const slots: Date[] = [];
    const baseDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        const slotTime = new Date(baseDate);
        slotTime.setHours(hour, minute, 0, 0);

        // Verificar se não passou do horário final
        const endTime = new Date(slotTime.getTime() + duration * 60 * 1000);
        if (endTime.getHours() > endHour) continue;

        // Verificar se está no futuro (para hoje)
        if (slotTime <= new Date()) continue;

        // Verificar disponibilidade
        if (
          appointmentUtils.isTimeSlotAvailable(appointments, slotTime, duration)
        ) {
          slots.push(slotTime);
        }
      }
    }

    return slots;
  },
};
