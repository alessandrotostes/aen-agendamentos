"use client";

import React, { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../lib/firebaseConfig";
import AuthLayout from "../../../components/shared/AuthLayout";
import { PublicRoute } from "../../../components/auth/ProtectedRoute";
import { validationUtils } from "../../../lib/utils";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar email
    if (!email) {
      setError("Email é obrigatório.");
      return;
    }

    if (!validationUtils.isValidEmail(email)) {
      setError("Email inválido.");
      return;
    }

    try {
      setError("");
      setLoading(true);

      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (error: unknown) {
      console.error("Erro ao enviar email de reset:", error);

      if (error instanceof Error) {
        // Traduzir erros comuns do Firebase
        if (error.message.includes("user-not-found")) {
          setError("Não existe uma conta com este email.");
        } else if (error.message.includes("too-many-requests")) {
          setError("Muitas tentativas. Tente novamente em alguns minutos.");
        } else {
          setError("Erro ao enviar email de recuperação. Tente novamente.");
        }
      } else {
        setError("Erro inesperado. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicRoute>
      <AuthLayout>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recuperar senha</h2>
          <p className="mt-2 text-sm text-gray-600">
            Digite seu email para receber um link de recuperação
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Email enviado!
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Verifique sua caixa de entrada e clique no link para redefinir sua
              senha.
            </p>

            <div className="space-y-3">
              <Link
                href="/login"
                className="block w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Voltar ao login
              </Link>

              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail("");
                }}
                className="block w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Enviar para outro email
              </button>
            </div>
          </div>
        ) : (
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
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="seu@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="opacity-25"
                    />
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      className="opacity-75"
                    />
                  </svg>
                  Enviando...
                </div>
              ) : (
                "Enviar link de recuperação"
              )}
            </button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                ← Voltar ao login
              </Link>
            </div>
          </form>
        )}
      </AuthLayout>
    </PublicRoute>
  );
}
