"use client";

import React, { useState } from "react";
// --- PASSO 1: Importar as ferramentas necessárias ---
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import ReauthModal from "@/components/shared/modals/ReauthModal";
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

// --- PASSO 2: Definir as constantes de tempo ---
const REAUTH_TIMESTAMP_KEY = "ownerLastReauthTimestamp";
const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;

export default function SettingsTab({
  mpData,
  onEditEstablishment,
  onManageOperatingHours,
}: Props) {
  // --- PASSO 3: Adicionar os novos estados para o modal ---
  const [isReauthModalOpen, setIsReauthModalOpen] = useState(false);
  const [reauthError, setReauthError] = useState<string | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  // Este estado "guarda" a ação que queremos executar após a senha ser confirmada
  const [actionToConfirm, setActionToConfirm] = useState<(() => void) | null>(
    null
  );

  // --- PASSO 4: Adicionar as funções de lógica de reautenticação ---
  const initiateSecureAction = (action: () => void) => {
    const lastReauthTimestamp = sessionStorage.getItem(REAUTH_TIMESTAMP_KEY);
    const timeSinceLastReauth = Date.now() - Number(lastReauthTimestamp);

    if (lastReauthTimestamp && timeSinceLastReauth < FIVE_MINUTES_IN_MS) {
      action(); // Se a reautenticação for recente, executa a ação imediatamente
    } else {
      setActionToConfirm(() => action); // Guarda a ação para depois
      setIsReauthModalOpen(true); // Abre o modal para pedir a senha
    }
  };

  const handleReauthenticate = async (password: string) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user || !user.email) {
      setReauthError("Não foi possível encontrar os dados do proprietário.");
      return;
    }
    setIsLoadingAction(true);
    setReauthError(null);
    const credential = EmailAuthProvider.credential(user.email, password);
    try {
      await reauthenticateWithCredential(user, credential);
      sessionStorage.setItem(REAUTH_TIMESTAMP_KEY, Date.now().toString());
      setIsReauthModalOpen(false);
      if (actionToConfirm) {
        actionToConfirm(); // Executa a ação que estava guardada
      }
    } catch {
      setReauthError("Senha incorreta. Tente novamente.");
    } finally {
      setIsLoadingAction(false);
      setActionToConfirm(null); // Limpa a ação guardada
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
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
              <p className="text-slate-500">Carregando...</p>
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
                  {/* --- PASSO 5: Atualizar o onClick do botão "Trocar de conta" --- */}
                  <button
                    onClick={() =>
                      initiateSecureAction(mpData.connectMercadoPago)
                    }
                    disabled={mpData.loading || isLoadingAction}
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
                  <InfoTooltip>
                    Certifique-se de que a conta logada no seu navegador é a
                    conta correta do seu estabelecimento.
                  </InfoTooltip>
                </p>
                {/* --- PASSO 5: Atualizar o onClick do botão "Conectar" --- */}
                <button
                  onClick={() =>
                    initiateSecureAction(mpData.connectMercadoPago)
                  }
                  disabled={mpData.loading || isLoadingAction}
                  className="w-full px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                  Conectar com Mercado Pago
                </button>
              </div>
            )}
            {mpData.error && (
              <p className="text-red-600 text-sm mt-2">{mpData.error}</p>
            )}
          </div>
        </div>
      </div>

      {/* --- PASSO 6: Adicionar o ReauthModal ao JSX --- */}
      <ReauthModal
        isOpen={isReauthModalOpen}
        onClose={() => setIsReauthModalOpen(false)}
        onConfirm={handleReauthenticate}
        isLoading={isLoadingAction}
        error={reauthError}
      />
    </div>
  );
}
