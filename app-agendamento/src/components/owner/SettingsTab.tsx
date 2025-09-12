"use client";

import React from "react";
// ALTERAÇÃO: Importar o ícone de Configurações
import {
  Building,
  CreditCard,
  Clock,
  CheckCircle,
  Settings,
} from "lucide-react";
import InfoTooltip from "@/components/shared/InfoTooltip";

interface MpData {
  hasMpAccount: boolean;
  loading: boolean;
  connectMercadoPago: () => Promise<void>;
  error: string | null;
}

interface Props {
  mpData: MpData;
  onEditEstablishment: () => void;
  onManageOperatingHours: () => void;
}

const SettingCard = ({
  icon: Icon,
  title,
  description,
  buttonText,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
}) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
    <div className="flex items-center gap-3">
      <Icon className="w-6 h-6 text-teal-600" />
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
    </div>
    <p className="text-sm text-slate-500 mt-2 flex-grow">{description}</p>
    <button
      onClick={onClick}
      className="mt-4 w-full px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
    >
      {buttonText}
    </button>
  </div>
);

export default function SettingsTab({
  mpData,
  onEditEstablishment,
  onManageOperatingHours,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          {/* ALTERAÇÃO: Substituir emoji por ícone */}
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="w-8 h-8 text-slate-600" />
            Configurações
          </h2>
          <p className="text-slate-500 mt-1">
            Gerencie as informações do seu negócio e pagamentos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SettingCard
          icon={Building}
          title="Informações Gerais"
          description="Edite o nome, endereço, telefone e outras informações que seus clientes veem sobre o seu negócio."
          buttonText="Editar Informações"
          onClick={onEditEstablishment}
        />

        <SettingCard
          icon={Clock}
          title="Horário de Funcionamento"
          description="Defina os dias e horários padrão em que seu estabelecimento está aberto para agendamentos."
          buttonText="Gerir Horários"
          onClick={onManageOperatingHours}
        />

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-6 h-6 text-teal-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Pagamentos Online
            </h3>
          </div>
          <div>
            {mpData.loading ? (
              <p className="text-slate-500">A processar...</p>
            ) : mpData.hasMpAccount ? (
              <div className="text-center p-4 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 space-y-2">
                <div className="font-semibold flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>Sua conta do Mercado Pago está conectada.</span>
                </div>
                <p className="text-sm">
                  Você está pronto para receber pagamentos online.
                </p>
                <div className="pt-2">
                  <button
                    onClick={mpData.connectMercadoPago}
                    disabled={mpData.loading}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
                  >
                    Trocar de conta
                  </button>
                  <InfoTooltip>
                    Para trocar, saia da sua conta atual no site do Mercado Pago
                    e clique aqui para conectar uma nova.
                  </InfoTooltip>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-slate-500 mb-4">
                  Conecte sua conta do Mercado Pago para aceitar pagamentos
                  online de forma segura e automatizada.
                </p>
                <button
                  onClick={mpData.connectMercadoPago}
                  disabled={mpData.loading}
                  className="w-full px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                  Conectar com Mercado Pago
                </button>
                <InfoTooltip>
                  Certifique-se de que a conta logada no seu navegador é a conta
                  correta do seu estabelecimento.
                </InfoTooltip>
              </div>
            )}
            {mpData.error && (
              <p className="text-red-600 text-sm mt-2">{mpData.error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
