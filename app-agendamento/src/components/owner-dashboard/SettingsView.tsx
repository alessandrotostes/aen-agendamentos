// src/components/owner-dashboard/SettingsView.tsx
"use client";

import React from "react";
import { Establishment } from "@/types";

interface SettingsViewProps {
  establishment: Establishment | null;
  isConnectingStripe: boolean;
  isOnboarding: boolean;
  onCreateAccount: () => void;
  onOnboarding: () => void;
}

export default function SettingsView({
  establishment,
  isConnectingStripe,
  isOnboarding,
  onCreateAccount,
  onOnboarding,
}: SettingsViewProps) {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-gray-800">
          Configurações de Pagamento
        </h2>
        <div className="mt-4 pt-4 border-t">
          {establishment && establishment.stripeAccountId ? (
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-semibold text-green-800">
                ✅ Conta de Pagamento Conectada!
              </p>
              <p className="text-sm text-green-700 mt-1">
                Complete o cadastro no Stripe para poder receber pagamentos.
              </p>
              <button
                onClick={onOnboarding}
                disabled={isOnboarding}
                className="mt-4 inline-block px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700"
              >
                {isOnboarding
                  ? "Gerando link..."
                  : "Completar Cadastro / Gerenciar Conta"}
              </button>
            </div>
          ) : (
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-semibold text-blue-800">
                Conecte-se ao Stripe para receber pagamentos
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Seus clientes poderão pagar online e o dinheiro será repassado
                para sua conta.
              </p>
              <button
                onClick={onCreateAccount}
                disabled={isConnectingStripe}
                className="mt-4 inline-block px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700"
              >
                {isConnectingStripe ? "Conectando..." : "Conectar com Stripe"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
