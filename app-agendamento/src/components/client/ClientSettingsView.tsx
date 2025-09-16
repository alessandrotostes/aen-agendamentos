"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  User,
  Mail,
  Phone,
  Save,
  FileText,
  Settings,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import ConfirmationModal from "../../components/shared/modals/ConfirmationModal";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from "firebase/app";
import { useRouter } from "next/navigation";

export default function ClientSettingsView() {
  const { userData, logout, updateUserProfile, refreshUserData } = useAuth();
  const router = useRouter();

  // Estado para o formulário de dados pessoais
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  // Estado separado para as preferências de privacidade
  const [privacySettings, setPrivacySettings] = useState({
    marketingConsent: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        phone: userData.phone || "",
      });
      setPrivacySettings({
        marketingConsent: userData.marketingConsent || false,
      });
    }
  }, [userData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePrivacyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrivacySettings({
      ...privacySettings,
      [e.target.name]: e.target.checked,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    setIsLoading(true);
    setSuccessMessage("");
    try {
      await updateUserProfile(userData.uid, {
        ...formData,
        ...privacySettings,
      });
      await refreshUserData();
      setSuccessMessage("Suas preferências foram atualizadas com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      alert("Não foi possível atualizar suas preferências.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const functions = getFunctions(getApp(), "southamerica-east1");
      const deleteClientAccount = httpsCallable(
        functions,
        "deleteClientAccount"
      );
      await deleteClientAccount();

      alert("Sua conta foi excluída com sucesso.");

      await logout();
      router.push("/");
    } catch (error) {
      console.error("Erro ao excluir a conta:", error);
      alert(
        "Ocorreu um erro ao tentar excluir sua conta. Por favor, tente novamente."
      );
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          Configurações
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Gerencie suas informações pessoais e preferências de privacidade.
        </p>
      </div>

      {/* Card de Informações Pessoais */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3 mb-6">
          <User /> Informações Pessoais
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700"
              >
                Nome
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Seu nome"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700"
              >
                Sobrenome
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Seu sobrenome"
                />
              </div>
            </div>
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                id="email"
                value={userData?.email || ""}
                readOnly
                className="block w-full rounded-md border-gray-300 pl-10 bg-gray-50 text-gray-500 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="cpf"
              className="block text-sm font-medium text-gray-700"
            >
              CPF
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="cpf"
                id="cpf"
                value={userData?.cpf || "Não informado"}
                readOnly
                className="block w-full rounded-md border-gray-300 pl-10 bg-gray-50 text-gray-500 sm:text-sm"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Para corrigir ou alterar seu CPF, entre em contato com o suporte.
            </p>
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Telefone
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="(XX) XXXXX-XXXX"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
          {successMessage && (
            <p className="text-sm text-green-600 mt-4 text-right">
              {successMessage}
            </p>
          )}
        </form>
      </div>

      {/* Card para Preferências de Comunicação e Privacidade */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3 mb-6">
          <Settings /> Privacidade e Comunicações
        </h2>
        <div className="space-y-6">
          <div className="flex items-start">
            <div className="flex h-6 items-center">
              <input
                id="marketingConsent"
                name="marketingConsent"
                type="checkbox"
                checked={privacySettings.marketingConsent}
                onChange={handlePrivacyChange}
                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              />
            </div>
            <div className="ml-3 text-sm leading-6">
              <label
                htmlFor="marketingConsent"
                className="font-medium text-gray-900"
              >
                Comunicações de Marketing
              </label>
              <p className="text-gray-500">
                Receber e-mails sobre novidades, promoções e dicas relevantes da
                A&N Agendamentos.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              Gerenciamento da Conta
            </h3>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Excluir sua conta
                </p>
                <p className="text-sm text-gray-500">
                  Esta ação é permanente e não pode ser revertida.
                </p>
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100"
              >
                Excluir conta
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/terms-of-use"
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Termos de Utilização e Política de Privacidade
        </Link>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Confirmar Exclusão de Conta"
        message="Você tem certeza que deseja excluir sua conta? Esta ação é irreversível. Seus dados pessoais serão removidos e seu histórico de agendamentos será anonimizado."
        confirmText="Sim, excluir conta"
        cancelText="Cancelar"
        type="danger"
        loading={isDeleting}
      />
    </div>
  );
}
