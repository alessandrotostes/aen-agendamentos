"use client";

import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/CheckoutForm"; // O formulário que criaremos a seguir
import AuthLayout from "@/components/AuthLayout"; // Reutilizando nosso layout

// Carregamos a instância do Stripe fora do componente para evitar recriá-la a cada renderização
// Usamos a nossa chave publicável do arquivo .env.local
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function CheckoutPage() {
  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Finalizar Pagamento
        </h1>
        {/* O componente Elements é um "provedor" que dá acesso ao Stripe para os componentes filhos */}
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </div>
    </AuthLayout>
  );
}
