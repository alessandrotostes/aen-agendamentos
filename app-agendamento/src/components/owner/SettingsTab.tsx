"use client";

import React from "react";
import { Building, CreditCard, Clock } from "lucide-react";
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

export default function SettingsTab({
  mpData,
  onEditEstablishment,
  onManageOperatingHours,
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
        {/* Card de Informações do Estabelecimento (sem alterações) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <Building className="w-6 h-6 text-teal-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Informações Gerais
            </h3>
          </div>
          <p className="text-sm text-slate-500 mt-2">
            Edite o nome, endereço e outras informações do seu estabelecimento.{" "}
            <br /> Essas informações são importantes para que seus clientes
            possam encontrar e conhecer melhor o seu negócio.
          </p>
          <button
            onClick={onEditEstablishment}
            className="mt-4 w-full px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg"
          >
            Editar Informações
          </button>
        </div>

        {/* Card de Horário de Funcionamento (sem alterações) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-teal-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Horário de Funcionamento
            </h3>
          </div>
          <p className="text-sm text-slate-500 mt-2">
            Defina os horários em que seu estabelecimento está aberto.
          </p>
          <button
            onClick={onManageOperatingHours}
            className="mt-4 w-full px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg"
          >
            Gerir Horários
          </button>
        </div>

        {/* --- CARD DE PAGAMENTOS ATUALIZADO COM BOTÃO "TROCAR CONTA" --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border md:col-span-2">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-teal-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Configuração de Pagamentos
            </h3>
          </div>
          <div className="mt-4">
            {mpData.loading ? (
              <p className="text-slate-500">A processar...</p>
            ) : mpData.hasMpAccount ? (
              <div className="text-center p-4 bg-emerald-50 text-emerald-700 rounded-lg">
                <p className="font-semibold">
                  ✅ Sua conta do Mercado Pago está conectada.
                  <InfoTooltip>
                    Caso queira mudar a conta do mercado pago que está vinculada
                    ao seu estabelecimento, acesse mercadopago.com.br, clique em
                    sair da conta. Após se certificar que está
                    &quot;deslogado&quot; é só clicar em &quot;Trocar de
                    conta&quot; que abrirá a página do mercado livre para que
                    você possa se conectar com a conta desejada.
                  </InfoTooltip>
                </p>
                <p className="text-sm mt-1">
                  Você está pronto para receber pagamentos online com split de
                  taxas.
                </p>
                {/* BOTÃO ADICIONADO AQUI */}
                <button
                  onClick={mpData.connectMercadoPago}
                  disabled={mpData.loading}
                  className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
                >
                  Trocar de conta
                </button>
              </div>
            ) : (
              <div>
                <p className="text-slate-500 mb-4">
                  Conecte com o Mercado Pago para receber pagamentos online dos
                  seus clientes e gerir o seu negócio.
                </p>
                <InfoTooltip>
                  Antes de se conctar ao Mercado Pago, certifique-se de que a
                  conta que está &quot;logada&quot; no seu navagador é a conta
                  do seu estabelecimento, para que o pagamento seja direcionado
                  corretamente. Certifique-se também de que a conta do Mercado
                  Pago está verificada e apta a receber pagamentos online. Se
                  você ainda não tem uma conta no Mercado Pago, pode criar uma
                  gratuitamente em mercadopago.com.br.
                </InfoTooltip>
                <button
                  onClick={mpData.connectMercadoPago}
                  disabled={mpData.loading}
                  className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
                >
                  Conectar com Mercado Pago
                </button>
              </div>
            )}
            {mpData.error && (
              <p className="text-red-500 text-sm mt-2">{mpData.error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
