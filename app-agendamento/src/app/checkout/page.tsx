"use client";

import React, { useEffect, useState } from "react";
import {
  getFunctions,
  httpsCallable,
  HttpsCallableResult,
} from "firebase/functions"; // HttpsCallableResult importado
import { getApp } from "firebase/app";
import ContentLayout from "../../components/shared/ContentLayout";
import { ClientRoute } from "../../components/auth/ProtectedRoute";
import { PendingAppointment } from "../../types";
import { useAuth } from "@/contexts/AuthContext";

// Interface para tipar a resposta da nossa Cloud Function
interface PreferenceResultData {
  success: boolean;
  init_point?: string;
  message?: string;
}

const MercadoPagoBadge = () => (
  <div className="flex justify-center items-center gap-2">
    <p className="text-xs text-gray-500">Pagamento seguro com</p>
<<<<<<< HEAD
    <Image
      src="/images/mercado-pago-logo.svg"
      alt="Logo do Mercado Pago"
      width={200}
      height={50}
    />
=======
    <svg
      width="80"
      height="25"
      viewBox="0 0 490 68"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M44.7362 67.3168H3.34222C1.49202 67.3168 0 65.8118 0 63.9439V32.4824C0 30.6145 1.49202 29.1095 3.34222 29.1095H44.7362C46.5864 29.1095 48.0784 30.6145 48.0784 32.4824V63.9439C48.0784 65.8118 46.5864 67.3168 44.7362 67.3168Z"
        fill="#009EE3"
      />
      <path
        d="M129.231 67.3168H94.1363V29.1095H129.231V37.2662H104.93V45.2856H127.859V53.4423H104.93V67.3168H129.231Z"
        fill="#009EE3"
      />
      <path
        d="M149.231 29.1095H138.438V67.3168H149.231V29.1095Z"
        fill="#009EE3"
      />
      <path
        d="M213.91 29.1095H201.275L183.18 57.0725H182.906L164.781 29.1095H152.145V67.3168H162.938V41.6552H163.213L178.619 67.3168H187.494L202.9 41.6552H203.174V67.3168H213.91V29.1095Z"
        fill="#009EE3"
      />
      <path
        d="M259.083 67.3168H223.988V29.1095H259.083V37.2662H234.782V45.2856H257.711V53.4423H234.782V67.3168H259.083Z"
        fill="#009EE3"
      />
      <path
        d="M283.432 29.1095H272.639V67.3168H283.432V29.1095Z"
        fill="#009EE3"
      />
      <path
        d="M331.008 29.1095H291.681V37.2662H308.791V67.3168H318.584V37.2662H331.008V29.1095Z"
        fill="#009EE3"
      />
      <path
        d="M373.913 29.1095C365.174 29.1095 358.913 35.1502 358.913 42.4137V54.0227C358.913 61.2862 365.174 67.3168 373.913 67.3168H382.652V60.0533H375.051C371.309 60.0533 369.706 57.5701 369.706 54.349V42.0874C369.706 38.8663 371.309 36.373 375.051 36.373H382.652V29.1095H373.913Z"
        fill="#009EE3"
      />
      <path
        d="M435.538 41.3415C435.538 34.3323 431.119 29.1095 421.327 29.1095H397.025V67.3168H407.818V50.1343H418.571L424.46 67.3168H436.331L428.093 47.7686C432.85 46.5204 435.538 44.2057 435.538 41.3415ZM421.17 42.2764H407.818V36.373H421.17C423.551 36.373 424.782 38.3188 424.782 40.068C424.782 41.8171 423.551 42.2764 421.17 42.2764Z"
        fill="#009EE3"
      />
      <path
        d="M490 35.1957C490 31.8415 487.619 29.1095 483.504 29.1095H468.236V36.7214H479.914C481.517 36.7214 482.028 37.6054 482.028 38.6432C482.028 40.5225 479.278 40.8362 476.527 41.21L466.735 42.6247V43.1436C468.925 42.8496 475.215 42.3307 479.914 44.5721L471.278 67.3168H483.055L490 60.0533V35.1957ZM445.69 29.1095L438.309 51.5226L430.928 29.1095H418.156L434.156 67.3168H444.203L461.342 29.1095H445.69Z"
        fill="#73C400"
      />
      <path
        d="M84.7216 1.18221C80.8996 -0.126584 76.7846 0.0107336 73.1936 2.0195C69.6026 4.02827 66.8246 7.62512 65.7336 11.664C65.3446 13.0689 67.1456 14.1166 68.3016 13.2425C73.8166 9.4719 82.2036 9.17792 88.0836 12.4484C93.9636 15.7188 97.4306 22.316 96.6906 28.9818C95.9506 35.6477 91.0746 41.2666 84.7216 43.1436V1.18221Z"
        fill="#009EE3"
      />
      <path
        d="M63.8821 54.4372C67.7041 55.746 71.8191 55.6087 75.4101 53.6C78.9913 51.5979 81.7749 48.001 82.8651 43.9519C83.2541 42.547 81.4531 41.5091 80.2971 42.3733C74.7821 46.1439 66.3951 46.4379 60.5151 43.1675C54.6351 39.897 51.1681 33.2998 51.9081 26.634C52.6481 19.9681 57.5241 14.3492 63.8821 12.4722V54.4372Z"
        fill="#73C400"
      />
    </svg>
>>>>>>> parent of fab462e (feat: aprimorar componentes de UI e adicionar novos modais para cancelamento e reembolso)
  </div>
);

export default function CheckoutPage() {
  const { userData } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingAppointment, setPendingAppointment] =
    useState<PendingAppointment | null>(null);

  useEffect(() => {
    const appointmentData = sessionStorage.getItem("pendingAppointment");
    if (appointmentData) {
      setPendingAppointment(JSON.parse(appointmentData));
    } else {
      setError("Nenhum agendamento encontrado. Por favor, tente novamente.");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
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

        // CORREÇÃO 1: Tipagem do resultado
        const result = (await createPreference(
          preferenceData
        )) as HttpsCallableResult<PreferenceResultData>;

        if (result.data.success && result.data.init_point) {
          window.location.href = result.data.init_point;
        } else {
          throw new Error(
            result.data.message || "Não foi possível gerar o link de pagamento."
          );
        }
      } catch (err: unknown) {
        // CORREÇÃO 2: Uso do 'unknown'
        console.error("Erro ao criar preferência de pagamento:", err);
        const message =
          err instanceof Error
            ? err.message
            : "Ocorreu um erro. Por favor, tente novamente.";
        setError(message);
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
