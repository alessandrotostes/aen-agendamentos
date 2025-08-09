"use client";

import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import SuccessModal from "./SuccessModal"; // 1. Importar nosso modal reutilizável

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

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // 2. Novo estado para controlar a visibilidade do modal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setProcessing(false);
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      setError(error.message || "Ocorreu um erro.");
      setProcessing(false);
    } else {
      setError(null);
      console.log("Método de Pagamento criado com sucesso:", paymentMethod);

      // 3. Em vez de alert(), abrimos o modal
      setIsSuccessModalOpen(true);
      setProcessing(false);
    }
  };

  return (
    // 4. Envolvemos o retorno em um Fragment <> para adicionar o modal
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
          {processing ? "Processando..." : "Pagar R$ XX,XX"}
        </button>
      </form>

      {/* 5. Adicionamos o modal de sucesso aqui */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Interface Conectada!"
        message="A comunicação com o sistema de pagamento foi estabelecida com sucesso. O pagamento ainda não foi processado."
      />
    </>
  );
}
