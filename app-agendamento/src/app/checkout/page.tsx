"use client";

import React, { useEffect, useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from "firebase/app";
import ContentLayout from "../../components/shared/ContentLayout";
import { ClientRoute } from "../../components/auth/ProtectedRoute";
import { PendingAppointment } from "../../types";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

// Componente para o selo de segurança do Mercado Pago (mantido)
const MercadoPagoBadge = () => (
  <div className="flex justify-center items-center gap-2 mt-8 border-t pt-6">
    <p className="text-xs text-gray-500">Pagamento seguro com</p>
    <Image
      src="/images/mercado-pago-logo.svg" // Caminho para a imagem
      alt="Logo do Mercado Pago"
      width={200}
      height={50}
    />
  </div>
);

export default function CheckoutPage() {
  const { userData } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingAppointment, setPendingAppointment] =
    useState<PendingAppointment | null>(null);

  useEffect(() => {
    // Recupera os dados do agendamento
    const appointmentData = sessionStorage.getItem("pendingAppointment");
    if (appointmentData) {
      setPendingAppointment(JSON.parse(appointmentData));
    } else {
      setError("Nenhum agendamento encontrado. Por favor, tente novamente.");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Inicia o processo de pagamento assim que os dados do agendamento e do utilizador estiverem disponíveis
    if (!pendingAppointment || !userData) {
      return;
    }

    const createPreferenceAndRedirect = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const functions = getFunctions(getApp(), "southamerica-east1");
        const createPreference = httpsCallable(
          functions,
          "createMercadoPagoPreference"
        );

        const preferenceData = {
          transaction_amount: pendingAppointment.price,
          payer: {
            email: userData.email,
            first_name: userData.name,
          },
          appointmentDetails: pendingAppointment,
        };

        const result: any = await createPreference(preferenceData);

        if (result.data.success && result.data.init_point) {
          // Redireciona o utilizador para o Checkout Pro
          window.location.href = result.data.init_point;
        } else {
          throw new Error(
            result.data.message || "Não foi possível gerar o link de pagamento."
          );
        }
      } catch (err: any) {
        console.error("Erro ao criar preferência de pagamento:", err);
        setError(err.message || "Ocorreu um erro. Por favor, tente novamente.");
        setIsLoading(false);
      }
    };

    createPreferenceAndRedirect();
  }, [pendingAppointment, userData]);

  return (
    <ClientRoute>
      <ContentLayout footer={<MercadoPagoBadge />}>
        <div className="w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            A Preparar o seu Pagamento
          </h2>
          {isLoading && (
            <div className="flex flex-col items-center gap-4 mt-8">
              <svg
                className="animate-spin h-8 w-8 text-teal-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-gray-600">
                A redirecionar para um ambiente seguro de pagamento...
              </p>
            </div>
          )}
          {error && (
            <div className="mt-8 p-4 bg-red-50 text-red-700 rounded-lg">
              <p className="font-semibold">Ocorreu um Erro</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}
        </div>
      </ContentLayout>
    </ClientRoute>
  );
}
