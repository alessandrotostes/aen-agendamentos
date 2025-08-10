"use client";

import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import SuccessModal from "./SuccessModal";
import { useAuth } from "@/contexts/AuthContext";

const cardElementOptions = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": { color: "#aab7c4" },
    },
    invalid: { color: "#fa755a", iconColor: "#fa755a" },
  },
};

export default function CheckoutForm() {
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
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
      await stripe.createPaymentMethod({ type: "card", card: cardElement });
    if (paymentMethodError) {
      setError(paymentMethodError.message ?? "Erro ao validar o cartão.");
      setProcessing(false);
      return;
    }

    try {
      console.log("Frontend: Preparando para chamar a Cloud Function...");
      const idToken = await user.getIdToken();
      const amount = 1000;

      const response = await fetch(
        "https://southamerica-east1-webappagendamento-1c932.cloudfunctions.net/createpaymentintent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            paymentMethodId: paymentMethod.id,
            amount: amount,
          }),
        }
      );

      console.log("Frontend: Resposta recebida do servidor:", response);
      const result = await response.json();
      console.log("Frontend: Corpo da resposta (JSON):", result);

      if (!response.ok) {
        throw new Error(
          result.error || `Falha na requisição com status ${response.status}`
        );
      }
      if (result.success) {
        setIsSuccessModalOpen(true);
      } else {
        throw new Error(result.error || "O pagamento falhou no servidor.");
      }
    } catch (err) {
      console.error("--- ERRO DETALHADO AO CHAMAR A FUNÇÃO (FRONTEND) ---");
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro inesperado. Verifique o console.");
      }
    } finally {
      setProcessing(false);
    }
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
          {processing ? "Processando..." : "Pagar R$ 10,00"}
        </button>
      </form>
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Pagamento Realizado!"
        message="Seu pagamento foi processado com sucesso."
      />
    </>
  );
}
