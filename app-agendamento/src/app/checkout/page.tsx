"use client";

import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/CheckoutForm";
import AuthLayout from "@/components/AuthLayout";
import { PendingAppointment } from "@/types"; // Importando nosso novo tipo

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function CheckoutPage() {
  // Corrigido: Usando a interface PendingAppointment em vez de 'any'
  const [pendingAppointment, setPendingAppointment] =
    useState<PendingAppointment | null>(null);

  useEffect(() => {
    const appointmentData = sessionStorage.getItem("pendingAppointment");
    if (appointmentData) {
      setPendingAppointment(JSON.parse(appointmentData));
    }
  }, []);

  if (!pendingAppointment) {
    return (
      <AuthLayout>
        <div className="text-center p-8 bg-white rounded-lg shadow-xl">
          Carregando detalhes do agendamento...
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Finalizar Pagamento
        </h1>
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
        <Elements stripe={stripePromise}>
          <CheckoutForm pendingAppointment={pendingAppointment} />
        </Elements>
      </div>
    </AuthLayout>
  );
}
