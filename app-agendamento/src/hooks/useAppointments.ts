"use client";

import { useState } from "react";
import { Timestamp } from "firebase/firestore";
import { Appointment } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { useFirestore } from "./useFirestore";
import { errorUtils, timestampUtils } from "../lib/utils";

// ========== APPOINTMENTS HOOK (SEM ALTERAÇÕES) ==========
export function useAppointments() {
  const { userData } = useAuth();

  const ownerAppointments = useFirestore<Appointment>("appointments", {
    realtime: true,
    whereConditions:
      userData?.uid && userData.role === "owner"
        ? [{ field: "establishmentId", operator: "==", value: userData.uid }]
        : [],
    orderByField: "dateTime",
    orderDirection: "asc",
  });

  const clientAppointments = useFirestore<Appointment>("appointments", {
    realtime: true,
    whereConditions:
      userData?.uid && userData.role === "client"
        ? [{ field: "clientId", operator: "==", value: userData.uid }]
        : [],
    orderByField: "dateTime",
    orderDirection: "desc",
  });

  const appointments =
    userData?.role === "owner" ? ownerAppointments : clientAppointments;

  return {
    appointments: appointments.data,
    loading: appointments.loading,
    error: appointments.error,
    refresh: appointments.refresh,
  };
}

// ========== APPOINTMENTS FOR DATE HOOK (LÓGICA CORRIGIDA) ==========
export function useAppointmentsForDate(date: Date) {
  const { userData } = useAuth();

  // O 'startOfDay' está correto: início do dia selecionado.
  const startOfDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  // O 'endOfDay' agora é o final do dia selecionado (23:59:59.999).
  // Isso evita problemas de fuso horário e garante que todos os agendamentos
  // daquele dia sejam incluídos, não importa a hora.
  const endOfDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999
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
            // A consulta agora usa '<=' para incluir o final do dia.
            {
              field: "dateTime",
              operator: "<=",
              value: Timestamp.fromDate(endOfDay),
            },
          ]
        : [],
    orderByField: "dateTime",
    orderDirection: "asc",
  });

  return {
    appointmentsForDate: appointments,
    loading,
    error,
    refresh,
  };
}

// ========== APPOINTMENT UTILITIES (SEM ALTERAÇÕES) ==========
export const appointmentUtils = {
  filterByStatus: (
    appointments: Appointment[],
    status: Appointment["status"]
  ) => {
    return appointments.filter((app) => app.status === status);
  },

  filterToday: (appointments: Appointment[]) => {
    return appointments.filter((app) => timestampUtils.isToday(app.dateTime));
  },

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
      return targetStart < appEnd && targetEnd > appStart;
    });
  },

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
        const endTime = new Date(slotTime.getTime() + duration * 60 * 1000);
        if (endTime.getHours() > endHour) continue;
        if (slotTime <= new Date()) continue;
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
