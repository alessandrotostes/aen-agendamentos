"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import AuthLayout from "../../../components/shared/AuthLayout";
import { validationUtils } from "../../../lib/utils";
import { FirebaseError } from "firebase/app";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter(); // router é mantido para outras lógicas se necessário

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const validateForm = (): string | null => {
    if (!formData.email) return "Email é obrigatório.";
    if (!validationUtils.isValidEmail(formData.email)) return "Email inválido.";
    if (!formData.password) return "Senha é obrigatória.";
    if (formData.password.length < 6)
      return "Senha deve ter pelo menos 6 caracteres.";
    return null;
  };

  // --- FUNÇÃO handleSubmit CORRIGIDA ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      // Sucesso! Não fazemos mais nada aqui.
      // O AuthContext vai detetar o login e o ProtectedRoute vai fazer o redirecionamento.
    } catch (err: unknown) {
      // Corrigido para unknown
      let errorMessage = "Ocorreu um erro inesperado. Tente novamente.";
      if (err instanceof FirebaseError) {
        if (
          err.code === "auth/invalid-credential" ||
          err.code === "auth/user-not-found" ||
          err.code === "auth/wrong-password"
        ) {
          errorMessage = "Email ou senha inválidos.";
        }
      }
      console.error("Erro no login:", err);
      setError(errorMessage);
    } finally {
      // Garante que o loading seja desativado, quer o login tenha sucesso ou falhe
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Entrar na sua conta
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Ou{" "}
          <Link
            href="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            criar uma nova conta
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Senha
            </label>
            <Link
              href="/reset-password"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <div className="mt-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Acesso rápido para teste
              </span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() =>
                setFormData({ email: "owner@teste.com", password: "123456" })
              }
              className="w-full py-2 px-4 border border-gray-300 rounded-md bg-white text-gray-500 hover:bg-gray-50"
            >
              👨‍💼 Estabelecimento
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData({ email: "cliente@teste.com", password: "123456" })
              }
              className="w-full py-2 px-4 border border-gray-300 rounded-md bg-white text-gray-500 hover:bg-gray-50"
            >
              👤 Cliente
            </button>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
