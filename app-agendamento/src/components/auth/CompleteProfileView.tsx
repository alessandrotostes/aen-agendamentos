// src/components/auth/CompleteProfileView.tsx (NOVO ARQUIVO)
"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { validationUtils } from "@/lib/utils";
import { Phone, FileText } from "lucide-react";

export default function CompleteProfileView() {
  const { userData, updateUserProfile, refreshUserData } = useAuth();
  const [formData, setFormData] = useState({ phone: "", cpf: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === "phone") formattedValue = validationUtils.formatPhone(value);
    if (name === "cpf") formattedValue = validationUtils.formatCPF(value);
    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validationUtils.isValidPhone(formData.phone)) {
      setError("Por favor, insira um número de telefone válido.");
      return;
    }
    if (!validationUtils.isValidCPF(formData.cpf)) {
      setError("Por favor, insira um CPF válido.");
      return;
    }
    if (!userData) return;

    setIsLoading(true);
    setError("");
    try {
      await updateUserProfile(userData.uid, {
        phone: formData.phone,
        cpf: formData.cpf,
        profileStatus: "complete",
      });
      await refreshUserData();
    } catch (err) {
      setError("Ocorreu um erro ao salvar seus dados.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 text-center">
          Só mais um passo!
        </h2>
        <p className="text-center text-gray-500 text-sm mt-2">
          Bem-vindo(a), {userData?.firstName}! Por favor, complete seu cadastro
          para continuar.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Telefone (WhatsApp)
            </label>
            <div className="relative mt-1">
              <Phone
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                name="phone"
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full rounded-md border-gray-300 py-2 pl-10 pr-3 focus:border-indigo-500 focus:ring-indigo-500"
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
            <div className="relative mt-1">
              <FileText
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                name="cpf"
                id="cpf"
                type="tel"
                value={formData.cpf}
                onChange={handleInputChange}
                required
                className="w-full rounded-md border-gray-300 py-2 pl-10 pr-3 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-teal-600 text-white font-bold py-3 rounded-lg hover:bg-teal-700 disabled:bg-teal-400"
          >
            {isLoading ? "Salvando..." : "Salvar e Continuar"}
          </button>
        </form>
      </div>
    </div>
  );
}
