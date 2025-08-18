"use client";

import { useEffect, useState } from "react";
import {
  Timestamp,
  collectionGroup,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { Appointment } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { useFirestore } from "./useFirestore";
import { db } from "../lib/firebaseConfig"; // Import db para a consulta collectionGroup
import { errorUtils, timestampUtils } from "../lib/utils";
import { getAuth } from "firebase/auth";

// ========== APPOINTMENTS HOOK (LÓGICA CORRIGIDA PARA O CLIENTE) ==========
export function useAppointments() {
  const { userData } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userData?.uid || userData.role !== "client") {
      setLoading(false);
      setAppointments([]);
      return;
    }

    setLoading(true);
    // Usamos uma consulta 'collectionGroup' para buscar em todas as subcoleções 'appointments'
    // onde o cliente é o mesmo. Esta é a forma correta de fazer esta busca.
    const q = query(
      collectionGroup(db, "appointments"),
      where("clientId", "==", userData.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const apps = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Appointment)
        );
        // Ordena por data descendente para mostrar os mais recentes primeiro
        apps.sort((a, b) => b.dateTime.toMillis() - a.dateTime.toMillis());
        setAppointments(apps);
        setLoading(false);
      },
      (err) => {
        console.error("Erro no listener de appointments (cliente):", err);
        setError(errorUtils.getFirebaseErrorMessage(err));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userData]);

  return {
    appointments,
    loading,
    error,
    refresh: () => {}, // O onSnapshot já atualiza em tempo real
  };
}

// ========== APPOINTMENTS FOR DATE HOOK (LÓGICA CORRIGIDA PARA O OWNER) ==========
export function useAppointmentsForDate(date: Date) {
  const { userData } = useAuth();

  // A lógica para definir o início e o fim do dia está perfeita.
  const startOfDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const endOfDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999
  );

  // AQUI ESTÁ A MUDANÇA: Apontamos para a subcoleção dentro do estabelecimento do owner.
  const collectionPath = userData?.uid
    ? `establishments/${userData.uid}/appointments`
    : null;

  const {
    data: appointments,
    loading,
    error,
    refresh,
  } = useFirestore<Appointment>(collectionPath, {
    realtime: true,
    whereConditions:
      userData?.uid && userData.role === "owner"
        ? [
            {
              field: "dateTime",
              operator: ">=",
              value: Timestamp.fromDate(startOfDay),
            },
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
// ========== HOOK PARA BUSCAR AGENDAMENTOS DO PROFISSIONAL LOGADO ==========
export function useAppointmentsForProfessional(date: Date) {
  const { userData } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Só executa se tivermos um utilizador e se ele for um profissional
    if (!userData?.uid || userData.role !== "professional") {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Define o início e o fim do dia para a consulta
    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const endOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999
    );

    // Consulta 'collectionGroup' para buscar em todos os agendamentos da plataforma
    const q = query(
      collectionGroup(db, "appointments"),
      // Filtra para trazer apenas os agendamentos deste profissional
      where("professionalAuthUid", "==", userData.uid),
      // Filtra pelo dia selecionado
      where("dateTime", ">=", Timestamp.fromDate(startOfDay)),
      where("dateTime", "<=", Timestamp.fromDate(endOfDay))
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const apps = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Appointment)
        );
        // Ordena por hora
        apps.sort((a, b) => a.dateTime.toMillis() - b.dateTime.toMillis());
        setAppointments(apps);
        setLoading(false);
      },
      (err) => {
        console.error("Erro no listener de appointments (professional):", err);
        setError(errorUtils.getFirebaseErrorMessage(err));
        setLoading(false);
      }
    );

    return () => unsubscribe();
    // Re-executa sempre que o profissional ou a data selecionada mudar
  }, [userData, date]);

  return { appointments, loading, error };
}
