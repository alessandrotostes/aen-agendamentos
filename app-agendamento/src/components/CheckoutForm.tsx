"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import SuccessModal from "./SuccessModal";
import { useAuth } from "@/contexts/AuthContext";
import { PendingAppointment } from "@/types"; // Importando nosso tipo compartilhado

const cardElementOptions = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
};

// Definindo o tipo correto para as props do componente
export default function CheckoutForm({
  pendingAppointment,
}: {
  pendingAppointment: PendingAppointment;
}) {
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);

    if (!stripe || !elements || !user) {
      setError("Usuário não autenticado ou Stripe não carregado.");
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setProcessing(false);
      return;
    }

    const { error: paymentMethodError, paymentMethod } =
      await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

    if (paymentMethodError) {
      setError(
        paymentMethodError.message ?? "Ocorreu um erro ao validar o cartão."
      );
      setProcessing(false);
      return;
    }

    try {
      const idToken = await user.getIdToken();
      const response = await fetch(
        "https://southamerica-east1-webappagendamento-1c932.cloudfunctions.net/createpaymentintent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          // O corpo agora contém os detalhes do agendamento, incluindo o timestamp correto
          body: JSON.stringify({
            paymentMethodId: paymentMethod.id,
            amount: pendingAppointment.price * 100,
            appointmentDetails: pendingAppointment, // Enviamos o objeto inteiro
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Falha na requisição ao servidor.");
      }

      if (result.success) {
        sessionStorage.removeItem("pendingAppointment"); // Limpa os dados temporários
        setIsSuccessModalOpen(true);
      } else {
        throw new Error(result.error || "O pagamento falhou no servidor.");
      }
    } catch (err) {
      console.error("Erro ao chamar a Cloud Function:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro inesperado.");
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleSuccess = () => {
    setIsSuccessModalOpen(false);
    router.push("/dashboard");
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="mb-4 p-3 border rounded-md bg-white">
          <CardElement options={cardElementOptions} />
        </div>
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        <button
          type="submit"
          disabled={!stripe || processing}
          className="w-full px-4 py-3 font-semibold text-white bg-gradient-to-r from-teal-500 to-indigo-400 rounded-lg shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing
            ? "Processando..."
            : `Pagar R$ ${pendingAppointment.price.toFixed(2)}`}
        </button>
      </form>
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccess}
        title="Agendamento Confirmado!"
        message="Seu pagamento foi processado e seu horário foi agendado com sucesso."
      />
    </>
  );
}
