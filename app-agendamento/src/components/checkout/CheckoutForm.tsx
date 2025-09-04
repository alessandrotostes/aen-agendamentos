"use client";

import React, { useEffect, useState } from "react";
import { initMercadoPago, CardPayment } from "@mercadopago/sdk-react";
import {
  getFunctions,
  httpsCallable,
  HttpsCallableResult,
} from "firebase/functions";
import { getApp } from "firebase/app";
import AuthLayout from "../../components/shared/AuthLayout";
import { ClientRoute } from "../../components/auth/ProtectedRoute";
import { PendingAppointment } from "../../types";
import { useAuth } from "@/contexts/AuthContext";

// CORREÇÃO: Interfaces para tipagem
interface CardPaymentFormData {
  token: string;
  issuer_id: string;
  payment_method_id: string;
  installments: number;
}

interface PaymentResultData {
  success: boolean;
  status?: string;
  message?: string;
}

const MercadoPagoCheckoutForm = ({
  pendingAppointment,
}: {
  pendingAppointment: PendingAppointment;
}) => {
  const { userData } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const initialization = {
    amount: pendingAppointment.price,
  };

  const customization = {
    visual: {
      style: {
        theme: "flat",
        customVariables: {
          formBackgroundColor: "#F9FAFB",
          baseColor: "#0d9488",
          borderRadius: "0.5rem",
          inputBackgroundColor: "#FFFFFF",
        },
      },
    },
  };

  const onSubmit = async (formData: CardPaymentFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const functions = getFunctions(getApp(), "southamerica-east1");
      const createPayment = httpsCallable(
        functions,
        "createMercadoPagoPayment"
      );

      const paymentData = {
        transaction_amount: pendingAppointment.price,
        token: formData.token,
        issuer_id: formData.issuer_id,
        payment_method_id: formData.payment_method_id,
        installments: formData.installments,
        payer: {
          email: userData?.email || "",
          first_name: userData?.name || "Cliente",
        },
        appointmentDetails: pendingAppointment,
      };

      const result = (await createPayment(
        paymentData
      )) as HttpsCallableResult<PaymentResultData>;

      if (result.data.success && result.data.status === "approved") {
        alert("Pagamento aprovado e agendamento confirmado!");
        window.location.href = "/client";
      } else {
        throw new Error(
          result.data.message || "O pagamento não pôde ser processado."
        );
      }
    } catch (err: unknown) {
      console.error("Erro no pagamento:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Ocorreu um erro. Por favor, tente novamente.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onError = async (error: unknown) => {
    console.error("Erro no CardPayment Brick:", error);
    setError(
      "Ocorreu um erro ao carregar o formulário de pagamento. Verifique os seus dados."
    );
  };

  const onReady = async () => {
    console.log("CardPayment Brick está pronto.");
  };

  return (
    <div className="flex flex-col">
      <div className="w-full min-h-[320px]">
        <CardPayment
          initialization={initialization}
          customization={customization}
          onSubmit={onSubmit}
          onError={onError}
          onReady={onReady}
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {isLoading && (
        <p className="text-gray-500 text-sm mt-2">
          A processar o seu pagamento...
        </p>
      )}
    </div>
  );
};

export default function CheckoutPage() {
  const [pendingAppointment, setPendingAppointment] =
    useState<PendingAppointment | null>(null);
  const [isMpReady, setIsMpReady] = useState(false);

  useEffect(() => {
    const appointmentData = sessionStorage.getItem("pendingAppointment");
    if (appointmentData) {
      setPendingAppointment(JSON.parse(appointmentData));
    }

    const mpPublicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
    if (mpPublicKey) {
      initMercadoPago(mpPublicKey, {
        locale: "pt-BR",
      });
      setIsMpReady(true);
    } else {
      console.error(
        "Chave pública do Mercado Pago (NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY) não encontrada nas variáveis de ambiente."
      );
    }
  }, []);

  return (
    <ClientRoute>
      <AuthLayout>
        <div className="w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Finalizar Pagamento
          </h2>
          {pendingAppointment && isMpReady ? (
            <>
              <p className="text-gray-600 mb-6">
                Você está agendando{" "}
                <span className="font-bold text-teal-600">
                  {pendingAppointment.serviceName}
                </span>{" "}
                por{" "}
                <span className="font-bold">
                  R$ {pendingAppointment.price.toFixed(2)}
                </span>
                .
              </p>
              <MercadoPagoCheckoutForm
                pendingAppointment={pendingAppointment}
              />
            </>
          ) : (
<<<<<<< HEAD
            <p className="text-gray-500">Carregando checkout...</p>
=======
            <p className="text-gray-500">A carregar o checkout...</p>
>>>>>>> parent of fab462e (feat: aprimorar componentes de UI e adicionar novos modais para cancelamento e reembolso)
          )}
        </div>
      </AuthLayout>
    </ClientRoute>
  );
}
