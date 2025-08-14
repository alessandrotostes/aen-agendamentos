"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useStripePayment, PaymentData } from "../../hooks/useStripe";
import SuccessModal from "../shared/modals/SuccessModal";
import { PendingAppointment } from "../../types";

const cardElementOptions = {
  style: {
    base: {
      color: "#32325d",
      fontSize: "16px",
      "::placeholder": { color: "#aab7c4" },
    },
    invalid: { color: "#fa755a", iconColor: "#fa755a" },
  },
};

interface CheckoutFormProps {
  pendingAppointment: PendingAppointment;
}

export default function CheckoutForm({
  pendingAppointment,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { processPayment, loading, error } = useStripePayment();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const { error: paymentMethodError, paymentMethod } =
      await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

    if (paymentMethodError || !paymentMethod) {
      console.error(paymentMethodError);
      return;
    }

    try {
      // CORREÇÃO: "Traduzimos" os dados para o formato que o hook espera
      const paymentDataForHook: PaymentData = {
        ...pendingAppointment,
        dateTime: new Date(pendingAppointment.bookingTimestamp), // Converte a string para um objeto Date
      };

      const result = await processPayment(paymentMethod.id, paymentDataForHook);

      if (result.success) {
        sessionStorage.removeItem("pendingAppointment");
        setIsSuccessModalOpen(true);
      }
    } catch (err) {
      console.error(err);
      // O erro já é tratado e exibido pelo hook `useStripePayment`
    }
  };

  const handleSuccess = () => {
    setIsSuccessModalOpen(false);
    router.push("/client");
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
          disabled={!stripe || loading}
          className="w-full px-4 py-3 font-semibold text-white bg-gradient-to-r from-teal-500 to-indigo-400 rounded-lg shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading
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
