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
import { Appointment } from "@/types"; // Usando nosso tipo centralizado

// Ícones que usaremos no novo design
const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);
const ClockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

// Interface para os dados do estabelecimento que precisamos nesta view
interface Establishment extends DocumentData {
  id: string;
  businessName: string;
}

// Props que o componente receberá para a navegação
interface ClientViewProps {
  onNavigateToSearch: () => void;
}

// Componente de Card de Agendamento
const AppointmentCard = ({
  app,
  establishmentName,
}: {
  app: Appointment;
  establishmentName: string;
}) => {
  const isUpcoming =
    app.status === "confirmado" && app.dateTime.toDate() >= new Date();

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-5 border-l-4 ${
        app.status === "cancelado" ? "border-red-400" : "border-teal-500"
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-lg text-gray-800">{app.serviceName}</p>
          <p className="text-sm text-gray-600">com {app.professionalName}</p>
          <p className="text-sm text-gray-500 mt-1">em {establishmentName}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg text-gray-800">
            R$ {app.price.toFixed(2)}
          </p>
          {app.status === "cancelado" && (
            <span className="text-xs font-bold text-white bg-red-500 px-2 py-1 rounded-full mt-1 inline-block">
              CANCELADO
            </span>
          )}
        </div>
      </div>
      <div className="border-t my-4"></div>
      <div className="flex justify-between items-center text-sm text-gray-700">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <CalendarIcon />{" "}
            {format(app.dateTime.toDate(), "dd 'de' MMMM", { locale: ptBR })}
          </span>
          <span className="flex items-center gap-2">
            <ClockIcon /> {format(app.dateTime.toDate(), "HH:mm")}
          </span>
        </div>
        {isUpcoming && (
          <button className="px-4 py-2 text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 transition-colors">
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
};

export default function ClientView({ onNavigateToSearch }: ClientViewProps) {
  const { user, userProfile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
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
        if (establishmentIds.length > 0) {
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
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

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
      <div className="text-center p-8 text-gray-600">
        Carregando seus agendamentos...
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <section>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold text-gray-800">
            Próximos Agendamentos
          </h2>
          <button
            onClick={onNavigateToSearch}
            className="w-full sm:w-auto px-5 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
          >
            <SearchIcon />
            <span>Novo Agendamento</span>
          </button>
        </div>
        {upcomingAppointments.length > 0 ? (
          <div className="space-y-4">
            {upcomingAppointments.map((app) => (
              <AppointmentCard
                key={app.id}
                app={app}
                establishmentName={getEstablishmentName(app.establishmentId)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">
              Você não tem nenhum agendamento futuro.
            </p>
            <button
              onClick={onNavigateToSearch}
              className="mt-4 inline-block px-6 py-3 bg-gradient-to-r from-teal-500 to-indigo-400 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity"
            >
              Encontrar um Horário
            </button>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Histórico</h2>
        {pastAppointments.length > 0 ? (
          <div className="space-y-4">
            {pastAppointments.map((app) => (
              <AppointmentCard
                key={app.id}
                app={app}
                establishmentName={getEstablishmentName(app.establishmentId)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">
              Seu histórico de agendamentos aparecerá aqui.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
