"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  DocumentData,
  Timestamp,
} from "firebase/firestore";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Interfaces (adicionando 'status')
interface Appointment extends DocumentData {
  id: string;
  dateTime: Timestamp;
  serviceName: string;
  professionalName: string;
  establishmentId: string;
  status: "confirmado" | "cancelado"; // Agora conhecemos o status
}
interface Establishment extends DocumentData {
  id: string;
  businessName: string;
}

// Card de Agendamento agora mostra o status se for 'cancelado'
const AppointmentCard = ({
  app,
  establishmentName,
}: {
  app: Appointment;
  establishmentName: string;
}) => (
  <div
    className={`p-4 rounded-lg border ${
      app.status === "cancelado"
        ? "bg-red-50 border-red-200"
        : "bg-gray-50 border-gray-200"
    }`}
  >
    <div className="flex justify-between items-center">
      <p className="text-lg font-bold text-teal-600 capitalize">
        {format(app.dateTime.toDate(), "eeee, dd 'de' MMMM", { locale: ptBR })}
      </p>
      {app.status === "cancelado" && (
        <span className="text-xs font-bold text-white bg-red-500 px-2 py-1 rounded-full">
          CANCELADO
        </span>
      )}
    </div>
    <p className="text-3xl font-bold text-gray-800">
      {format(app.dateTime.toDate(), "HH:mm")}
    </p>
    <div className="mt-2 pt-2 border-t">
      <p className="font-semibold text-gray-700">{app.serviceName}</p>
      <p className="text-sm text-gray-500">
        em <span className="font-medium">{establishmentName}</span>
      </p>
      <p className="text-sm text-gray-500">
        com <span className="font-medium">{app.professionalName}</span>
      </p>
    </div>
  </div>
);

export default function ClientView() {
  const { user, userProfile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "appointments"),
      where("clientId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Appointment)
      );
      apps.sort((a, b) => b.dateTime.toMillis() - a.dateTime.toMillis());
      setAppointments(apps);

      if (apps.length > 0) {
        const establishmentIds = [
          ...new Set(apps.map((app) => app.establishmentId)),
        ];
        const estQuery = query(
          collection(db, "establishments"),
          where("__name__", "in", establishmentIds)
        );
        onSnapshot(estQuery, (estSnapshot) => {
          setEstablishments(
            estSnapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() } as Establishment)
            )
          );
        });
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Lógica de filtragem atualizada
  const upcomingAppointments = appointments.filter(
    (app) => app.status === "confirmado" && app.dateTime.toDate() >= new Date()
  );
  const pastAppointments = appointments.filter(
    (app) => app.status !== "confirmado" || app.dateTime.toDate() < new Date()
  );

  const getEstablishmentName = (id: string) =>
    establishments.find((e) => e.id === id)?.businessName || "Estabelecimento";

  if (isLoading) {
    return (
      <div className="text-center p-8">Carregando seus agendamentos...</div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Olá,{" "}
          <span className="text-teal-600">
            {userProfile?.displayName?.split(" ")[0] || "Cliente"}
          </span>
          !
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Precisa de um novo horário?
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-gradient-to-r from-teal-500 to-indigo-400 text-white font-bold text-lg rounded-lg shadow-lg hover:opacity-90 transition-transform transform hover:scale-105"
          >
            Encontrar um Horário
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Próximos Agendamentos
        </h2>
        {upcomingAppointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingAppointments.map((app) => (
              <AppointmentCard
                key={app.id}
                app={app}
                establishmentName={getEstablishmentName(app.establishmentId)}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            Você não tem agendamentos futuros.
          </p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Histórico de Agendamentos
        </h2>
        {pastAppointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastAppointments.map((app) => (
              <AppointmentCard
                key={app.id}
                app={app}
                establishmentName={getEstablishmentName(app.establishmentId)}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            Seu histórico de agendamentos aparecerá aqui.
          </p>
        )}
      </div>
    </div>
  );
}
