// src/components/client/ClientSettingsView.tsx (NOVO ARQUIVO)
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { User, Mail, Phone, Save } from "lucide-react";
import Link from "next/link";

export default function ClientSettingsView() {
  const { userData, updateUserProfile, refreshUserData } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        phone: userData.phone || "",
      });
    }
  }, [userData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    setIsLoading(true);
    setSuccessMessage("");
    try {
      await updateUserProfile(userData.uid, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });
      await refreshUserData(); // Atualiza os dados no contexto
      setSuccessMessage("Seus dados foram atualizados com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      alert("Não foi possível atualizar seus dados.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          Configurações da Conta
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Atualize suas informações pessoais.
        </p>
      </div>

      <div className="mt-12 bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Campo Nome */}
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
            {/* Campo Sobrenome */}
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
          {/* Campo Email (Apenas leitura por enquanto) */}
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
            <p className="mt-2 text-xs text-gray-500">
              A alteração de e-mail será implementada futuramente.
            </p>
          </div>
          {/* Campo Telefone */}
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

          {successMessage && (
            <p className="text-sm text-green-600">{successMessage}</p>
          )}

          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {isLoading ? "A guardar..." : "Guardar Alterações"}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/terms-of-use"
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Termos de Utilização e Política de Privacidade
        </Link>
      </div>
    </div>
  );
}
