"use client";

import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../../components/checkout/CheckoutForm";
import AuthLayout from "../../components/shared/AuthLayout";
import { ClientRoute } from "../../components/auth/ProtectedRoute";
import { PendingAppointment } from "../../types";

// Carregue a chave publicável do Stripe de suas variáveis de ambiente
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function CheckoutPage() {
  const [pendingAppointment, setPendingAppointment] =
    useState<PendingAppointment | null>(null);

  useEffect(() => {
    const appointmentData = sessionStorage.getItem("pendingAppointment");
    if (appointmentData) {
      setPendingAppointment(JSON.parse(appointmentData));
    }
  }, []);

  return (
    <ClientRoute>
      <AuthLayout>
        <div className="w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Finalizar Pagamento
          </h2>
          {pendingAppointment ? (
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
              <Elements stripe={stripePromise}>
                <CheckoutForm pendingAppointment={pendingAppointment} />
              </Elements>
            </>
          ) : (
            <p className="text-gray-500">
              Carregando detalhes do agendamento...
            </p>
          )}
        </div>
      </AuthLayout>
    </ClientRoute>
  );
}
