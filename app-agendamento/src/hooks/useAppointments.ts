"use client";

import { useEffect, useState } from "react";
import {
  Timestamp,
  collection,
  collectionGroup,
  query,
  where,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { Appointment } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebaseConfig";
import { errorUtils, timestampUtils } from "../lib/utils";

// HOOK PARA O CLIENTE
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
    refresh: () => {},
  };
}

// HOOK PARA O OWNER
export function useAppointmentsForDate(date: Date) {
  const { userData } = useAuth();
  const [appointmentsForDate, setAppointmentsForDate] = useState<Appointment[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userData?.uid || userData.role !== "owner" || !date) {
      setLoading(false);
      setAppointmentsForDate([]);
      return;
    }

    setLoading(true);
    setError(null);

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
    const collectionPath = `establishments/${userData.uid}/appointments`;

    const q = query(
      collection(db, collectionPath),
      where("dateTime", ">=", Timestamp.fromDate(startOfDay)),
      where("dateTime", "<=", Timestamp.fromDate(endOfDay))
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        if (snapshot.empty) {
          setAppointmentsForDate([]);
          setLoading(false);
          return;
        }

        const appointmentsData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Appointment)
        );

        const clientIds = [
          ...new Set(
            appointmentsData.map((app) => app.clientId).filter((id) => !!id)
          ),
        ];

        if (clientIds.length > 0) {
          try {
            const usersQuery = query(
              collection(db, "users"),
              where("uid", "in", clientIds)
            );
            const usersSnapshot = await getDocs(usersQuery);

            const usersMap = new Map<string, string>();
            usersSnapshot.forEach((doc) => {
              usersMap.set(doc.id, doc.data().name);
            });

            const enrichedAppointments = appointmentsData.map((app) => ({
              ...app,
              clientName:
                usersMap.get(app.clientId) || app.clientName || "Cliente",
            }));

            setAppointmentsForDate(enrichedAppointments);
          } catch (err) {
            console.error("Erro ao buscar nomes dos clientes:", err);
            setError("Não foi possível carregar os nomes dos clientes.");
            setAppointmentsForDate(appointmentsData);
          }
        } else {
          setAppointmentsForDate(appointmentsData);
        }

        setLoading(false);
      },
      (err) => {
        console.error("Erro no listener de appointments (owner):", err);
        setError(errorUtils.getFirebaseErrorMessage(err));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userData, date]);

  return { appointmentsForDate, loading, error, refresh: () => {} };
}

// UTILITIES
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

// HOOK PARA O PROFISSIONAL
export function useAppointmentsForProfessional(date: Date) {
  const { userData } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userData?.uid || userData.role !== "professional") {
      setLoading(false);
      setAppointments([]);
      return;
    }
    setLoading(true);
    setError(null);

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

    const q = query(
      collectionGroup(db, "appointments"),
      where("professionalAuthUid", "==", userData.uid),
      where("dateTime", ">=", Timestamp.fromDate(startOfDay)),
      where("dateTime", "<=", Timestamp.fromDate(endOfDay))
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        if (snapshot.empty) {
          setAppointments([]);
          setLoading(false);
          return;
        }

        const appointmentsData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Appointment)
        );

        const clientIds = [
          ...new Set(
            appointmentsData.map((app) => app.clientId).filter((id) => !!id)
          ),
        ];

        if (clientIds.length > 0) {
          try {
            const usersQuery = query(
              collection(db, "users"),
              where("uid", "in", clientIds)
            );
            const usersSnapshot = await getDocs(usersQuery);
            const usersMap = new Map<string, string>();
            usersSnapshot.forEach((doc) => {
              usersMap.set(doc.id, doc.data().name);
            });
            const enrichedAppointments = appointmentsData.map((app) => ({
              ...app,
              clientName:
                usersMap.get(app.clientId) || app.clientName || "Cliente",
            }));
            enrichedAppointments.sort(
              (a, b) => a.dateTime.toMillis() - b.dateTime.toMillis()
            );
            setAppointments(enrichedAppointments);
          } catch (err) {
            console.error(
              "Erro ao buscar nomes de clientes (professional):",
              err
            );
            setError("Não foi possível carregar os nomes dos clientes.");
            setAppointments(appointmentsData);
          }
        } else {
          setAppointments(appointmentsData);
        }

        setLoading(false);
      },
      (err) => {
        console.error("Erro no listener de appointments (professional):", err);
        setError(errorUtils.getFirebaseErrorMessage(err));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userData, date]);

  return { appointments, loading, error };
}
