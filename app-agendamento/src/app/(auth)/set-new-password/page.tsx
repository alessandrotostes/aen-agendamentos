"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { auth } from "../../../lib/firebaseConfig";
import AuthLayout from "../../../components/shared/AuthLayout";
import { validationUtils } from "../../../lib/utils";
import PasswordStrengthIndicator from "../../../components/shared/PasswordStrengthIndicator";
import { KeyRound, CheckCircle, AlertTriangle } from "lucide-react";
import LoadingSpinner from "../../../components/owner/common/LoadingSpinner";

const initialPasswordValidation = {
  minLength: false,
  lowercase: false,
  uppercase: false,
  number: false,
  specialChar: false,
};

// Componente principal que usa Suspense
export default function SetNewPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout>
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-2 text-sm text-gray-500">A verificar o link...</p>
          </div>
        </AuthLayout>
      }
    >
      <SetNewPasswordForm />
    </Suspense>
  );
}

// Componente que contém toda a lógica e a UI
function SetNewPasswordForm() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordValidation, setPasswordValidation] = useState(
    initialPasswordValidation
  );
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
      } catch (err) {
        setError(
          "O link de redefinição é inválido ou já expirou. Por favor, solicite um novo."
        );
        console.error("Erro ao verificar código:", err);
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

    const passwordCheck = validationUtils.validatePasswordStrength(password);
    if (!passwordCheck.isValid) {
      setError("A nova senha não cumpre todos os requisitos de segurança.");
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
    } catch (err) {
      setError(
        "Ocorreu um erro ao redefinir a senha. O link pode ter expirado."
      );
      console.error("Erro ao confirmar reset:", err);
    } finally {
      setLoading(false);
    }
  };

  if (isVerifyingCode) {
    return null;
  }

  if (!isCodeVerified || success) {
    return (
      <AuthLayout>
        <div className="text-center">
          {success ? (
            <>
              <div className="inline-block p-3 bg-emerald-50 rounded-full mb-4">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                Senha Redefinida!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Sua senha foi alterada com sucesso. Agora você já pode fazer
                login.
              </p>
              <Link
                href="/login"
                className="mt-6 w-full flex justify-center py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Ir para o Login
              </Link>
            </>
          ) : (
            <>
              <div className="inline-block p-3 bg-red-50 rounded-full mb-4">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                Link Inválido
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {error ||
                  "O link de redefinição de senha é inválido ou já expirou."}
              </p>
              <Link
                href="/reset-password"
                className="mt-6 w-full flex justify-center py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
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
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-indigo-50 rounded-full mb-4">
            <KeyRound className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Crie uma Nova Senha
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Digite abaixo a sua nova senha.
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
              onChange={(e) => {
                setPassword(e.target.value);
                const validation = validationUtils.validatePasswordStrength(
                  e.target.value
                );
                setPasswordValidation(validation);
              }}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="••••••••"
            />
            <PasswordStrengthIndicator validation={passwordValidation} />
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300"
          >
            {loading ? "Aguardando..." : "Redefinir Senha"}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
