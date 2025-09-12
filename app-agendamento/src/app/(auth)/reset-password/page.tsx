"use client";

import React, { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../lib/firebaseConfig";
import AuthLayout from "../../../components/shared/AuthLayout";
import { PublicRoute } from "../../../components/auth/ProtectedRoute";
import { validationUtils } from "../../../lib/utils";
import { MailQuestion, AlertTriangle, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      if (error instanceof Error && "code" in error) {
        const firebaseError = error as { code: string };
        if (firebaseError.code === "auth/user-not-found") {
          setError("Não existe uma conta com este email.");
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
        <div className="w-full max-w-sm mx-auto">
          {success ? (
            // --- TELA DE SUCESSO ---
            <div className="text-center">
              <div className="inline-block p-3 bg-emerald-50 rounded-full mb-4">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Email enviado!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Verifique a sua caixa de entrada e caixa de{" "}
                <strong>(SPAM)</strong> para redefinir a sua senha.
              </p>
              <div className="mt-6 space-y-3">
                <Link
                  href="/login"
                  className="w-full flex justify-center py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Voltar ao login
                </Link>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail("");
                  }}
                  className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
                >
                  Enviar para outro email
                </button>
              </div>
            </div>
          ) : (
            // --- FORMULÁRIO DE RECUPERAÇÃO ---
            <>
              <div className="text-center mb-8">
                <div className="inline-block p-3 bg-indigo-50 rounded-full mb-4">
                  <MailQuestion className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Esqueceu sua senha?
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Sem problemas! Digite o seu email abaixo e lhe enviaremos um
                  link para redefinir sua senha.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5" />
                    <span>{error}</span>
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
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="seu@email.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? "Enviando..." : "Enviar link de recuperação"}
                </button>

                <div className="text-center pt-2">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    ← Voltar ao Login
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </AuthLayout>
    </PublicRoute>
  );
}
