"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { FirebaseError } from "firebase/app"; // Importação corrigida
import { auth } from "../../../lib/firebaseConfig";
import AuthLayout from "../../../components/shared/AuthLayout";
import { Lock, CheckCircle, AlertTriangle } from "lucide-react";
import LoadingSpinner from "../../../components/owner/common/LoadingSpinner";

// Componente de carregamento para o fallback do Suspense
const PageLoading = () => (
  <AuthLayout>
    <LoadingSpinner />
  </AuthLayout>
);

// Componente principal que usa Suspense para aguardar os parâmetros da URL
export default function SetNewPasswordPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <SetNewPasswordForm />
    </Suspense>
  );
}

// Componente que contém toda a lógica
function SetNewPasswordForm() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(true);

  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode) {
        setError("Link de redefinição inválido ou ausente.");
        setIsVerifyingCode(false);
        return;
      }
      try {
        await verifyPasswordResetCode(auth, oobCode);
        setIsCodeVerified(true);
      } catch (err: unknown) {
        console.error("Erro ao verificar código:", err);
        setError(
          "O link de redefinição é inválido ou já expirou. Por favor, solicite um novo."
        );
      } finally {
        setIsVerifyingCode(false);
      }
    };
    verifyCode();
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (!oobCode) {
      setError("Código de redefinição não encontrado.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
    } catch (err: unknown) {
      console.error("Erro ao confirmar reset:", err);
      let errorMessage =
        "Ocorreu um erro ao redefinir a senha. O link pode ter expirado.";
      if (err instanceof FirebaseError) {
        if (err.code === "auth/weak-password") {
          errorMessage = "A senha é muito fraca. Tente uma mais forte.";
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isVerifyingCode) {
    return (
      <AuthLayout>
        <LoadingSpinner />
      </AuthLayout>
    );
  }

  if (!isCodeVerified || success) {
    return (
      <AuthLayout>
        <div className="text-center">
          {success ? (
            <>
              <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                Senha Redefinida!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                A sua senha foi alterada com sucesso. Agora você já pode fazer
                login.
              </p>
              <Link
                href="/login"
                className="mt-6 block w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Ir para o Login
              </Link>
            </>
          ) : (
            <>
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                Link Inválido
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {error ||
                  "O link de redefinição de senha é inválido ou já expirou."}
              </p>
              <Link
                href="/reset-password"
                className="mt-6 block w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Solicitar Novo Link
              </Link>
            </>
          )}
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <Lock className="mx-auto h-10 w-10 text-indigo-500" />
        <h2 className="mt-4 text-2xl font-bold text-gray-900">
          Crie uma Nova Senha
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Digite abaixo a sua nova senha.
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
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Nova Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Confirmar Nova Senha
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Aguarde..." : "Redefinir Senha"}
        </button>
      </form>
    </AuthLayout>
  );
}
