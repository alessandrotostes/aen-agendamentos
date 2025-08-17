"use client";

import React from "react";
import { Building, CreditCard, Clock, RefreshCw } from "lucide-react";

interface StripeData {
  hasStripeAccount: boolean;
  isStripeOnboarded: boolean;
  loading: boolean;
  createConnectedAccount: () => Promise<void>;
  createAccountLink: () => Promise<void>;
  error: string | null; // <-- Propriedade 'error' adicionada aqui
}

interface Props {
  // establishment foi removido, pois não estava a ser usado.
  stripeData: StripeData;
  onEditEstablishment: () => void;
  onManageOperatingHours: () => void;
  onRefreshStripeStatus: () => void;
}

export default function SettingsTab({
  stripeData,
  onEditEstablishment,
  onManageOperatingHours,
  onRefreshStripeStatus,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <span className="text-4xl mr-3">⚙️</span>
            Configurações
          </h2>
          <p className="text-teal-600 mt-1">
            Gerencie as informações do seu negócio e pagamentos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card de Informações do Estabelecimento */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <Building className="w-6 h-6 text-teal-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Informações Gerais
            </h3>
          </div>
          <p className="text-sm text-slate-500 mt-2">
            Edite o nome, endereço e outras informações do seu estabelecimento.
          </p>
          <button
            onClick={onEditEstablishment}
            className="mt-4 w-full px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg"
          >
            Editar Informações
          </button>
        </div>

        {/* Card de Horário de Funcionamento */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-teal-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Horário de Funcionamento
            </h3>
          </div>
          <p className="text-sm text-slate-500 mt-2">
            Defina os horários em que seu estabelecimento está aberto para os
            clientes.
          </p>
          <button
            onClick={onManageOperatingHours}
            className="mt-4 w-full px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg"
          >
            Gerir Horários
          </button>
        </div>

        {/* Card de Configurações de Pagamento (Stripe) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border md:col-span-2">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-teal-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Configuração de Pagamentos
            </h3>
          </div>
          <div className="mt-4">
            {stripeData.loading ? (
              <p className="text-slate-500">A verificar status da conta...</p>
            ) : stripeData.hasStripeAccount ? (
              stripeData.isStripeOnboarded ? (
                <div className="text-center p-4 bg-emerald-50 text-emerald-700 rounded-lg">
                  <p className="font-semibold">
                    ✅ Sua conta de pagamentos está ativa.
                  </p>
                  <p className="text-sm">
                    Você está pronto para receber pagamentos online.
                  </p>
                </div>
              ) : (
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <p className="text-amber-700 font-semibold mb-2">
                    Sua conta precisa de mais informações.
                  </p>
                  <p className="text-sm text-amber-600 mb-4">
                    Complete o cadastro no Stripe para começar a receber
                    pagamentos.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <button
                      onClick={stripeData.createAccountLink}
                      className="px-4 py-2 bg-indigo-500 text-white font-semibold rounded-lg"
                    >
                      Completar Configuração
                    </button>
                    <button
                      onClick={onRefreshStripeStatus}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Verificar Status
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div>
                <p className="text-slate-500 mb-4">
                  Conecte com o Stripe para receber pagamentos online dos seus
                  clientes de forma segura.
                </p>
                <button
                  onClick={stripeData.createConnectedAccount}
                  className="w-full px-4 py-2 bg-indigo-500 text-white font-semibold rounded-lg"
                >
                  Conectar com Stripe
                </button>
              </div>
            )}
            {stripeData.error && (
              <p className="text-red-500 text-sm mt-2">{stripeData.error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
