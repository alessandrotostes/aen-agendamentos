"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import ConfirmationModal from "../../components/shared/modals/ConfirmationModal";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from "firebase/app";
import {
  Settings,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";

// Criamos um tipo para o resultado da nossa função, evitando o 'any'
type CheckAppointmentsResult = {
  futureAppointmentsCount: number;
};

export default function OwnerSettingsView() {
  const { userData, logout } = useAuth();
  const router = useRouter();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [futureAppointmentsCount, setFutureAppointmentsCount] = useState<
    number | null
  >(null);
  const [isLoadingCount, setIsLoadingCount] = useState(true);

  useEffect(() => {
    if (userData?.uid) {
      const checkAppointments = async () => {
        setIsLoadingCount(true);
        try {
          const functions = getFunctions(getApp(), "southamerica-east1");
          const checkFutureAppointmentsFn = httpsCallable(
            functions,
            "checkFutureAppointments"
          );
          const result = await checkFutureAppointmentsFn({
            establishmentId: userData.uid,
          });
          // Usamos nosso novo tipo aqui para garantir a segurança
          const data = result.data as CheckAppointmentsResult;
          setFutureAppointmentsCount(data.futureAppointmentsCount);
        } catch (error) {
          console.error("Erro ao verificar agendamentos:", error);
          setFutureAppointmentsCount(null); // Trata o caso de erro
        } finally {
          setIsLoadingCount(false);
        }
      };
      checkAppointments();
    }
  }, [userData?.uid]);

  const handleDeleteAccount = async () => {
    if (!userData) return;

    setIsDeleting(true);
    try {
      const functions = getFunctions(getApp(), "southamerica-east1");
      const deleteOwnerAccount = httpsCallable(functions, "deleteOwnerAccount");

      await deleteOwnerAccount({ establishmentId: userData.uid });

      alert("Sua conta e estabelecimento foram excluídos com sucesso.");
      await logout();
      router.push("/");
    } catch (error: unknown) {
      // Tratamos o erro como 'unknown'
      console.error("Erro ao excluir a conta do estabelecimento:", error);
      // E então verificamos se é uma instância de Error para acessar 'message'
      let errorMessage = "Ocorreu um erro ao tentar excluir sua conta.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      alert(errorMessage);
      setIsDeleting(false);
    }
  };

  const canDelete = futureAppointmentsCount === 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="mb-6">
        <Link
          href="/owner/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o Painel
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Settings /> Configurações do Estabelecimento
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          Gerencie as opções avançadas da sua conta.
        </p>
      </div>

      {/* Card da Zona de Perigo */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-red-200">
        <h2 className="text-xl font-bold text-red-700 flex items-center gap-3 mb-4">
          <AlertTriangle /> Zona de Perigo
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-800">
              Excluir este estabelecimento
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Uma vez que você exclui seu estabelecimento, não há como voltar
              atrás. Todos os dados, incluindo profissionais, serviços e
              histórico de agendamentos, serão permanentemente removidos.
            </p>
          </div>

          <div className="p-4 rounded-lg border">
            {isLoadingCount ? (
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Clock className="w-4 h-4 animate-spin" /> Verificando
                agendamentos...
              </p>
            ) : canDelete ? (
              <div className="text-sm text-green-700 bg-green-50 border-green-200 p-3 rounded-md flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  <strong>Tudo certo!</strong> Sua conta não possui agendamentos
                  futuros e pode ser excluída a qualquer momento.
                </span>
              </div>
            ) : (
              <div className="text-sm text-yellow-800 bg-yellow-50 border-yellow-200 p-3 rounded-md flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  <strong>Atenção:</strong> Sua conta possui{" "}
                  <strong>
                    {futureAppointmentsCount} agendamento(s) ativo(s) no futuro
                  </strong>{" "}
                  e não poderá ser apagada até que todos sejam concluídos ou
                  cancelados.
                </span>
              </div>
            )}
          </div>

          <div className="text-right">
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={!canDelete || isLoadingCount}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
            >
              Excluir estabelecimento
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Confirmar Exclusão Permanente"
        message="Esta ação é irreversível e excluirá todos os dados associados ao seu estabelecimento. Por favor, confirme que você deseja prosseguir."
        confirmText="Sim, excluir tudo"
        type="danger"
        loading={isDeleting}
      />
    </div>
  );
}
