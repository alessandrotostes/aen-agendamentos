"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getFunctions,
  httpsCallable,
  HttpsCallableResult,
} from "firebase/functions";
import { getApp } from "firebase/app";
import { OwnerRoute } from "../../../components/auth/ProtectedRoute";
import LoadingSpinner from "../../../components/owner/common/LoadingSpinner";

// CORREÇÃO: Interface para tipar a resposta da Cloud Function
interface ExchangeResultData {
  success: boolean;
  message?: string;
}

export default function MercadoPagoRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const exchangeAuthCode = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");

      if (!code) {
        setErrorMessage(
          "O código de autorização não foi encontrado. Por favor, tente conectar novamente."
        );
        setStatus("error");
        return;
      }

      try {
        const functions = getFunctions(getApp(), "southamerica-east1");
        const exchangeCodeFn = httpsCallable(
          functions,
          "exchangeCodeForCredentials"
        );

        // CORREÇÃO: Tipagem do resultado
        const result = (await exchangeCodeFn({
          code,
          state,
        })) as HttpsCallableResult<ExchangeResultData>;

        if (result.data.success) {
          setStatus("success");
          setTimeout(() => {
            router.push("/owner?tab=settings");
          }, 3000);
        } else {
          throw new Error(
            result.data.message || "Não foi possível completar a conexão."
          );
        }
      } catch (err: unknown) {
        // CORREÇÃO: Uso do 'unknown'
        console.error("Erro ao trocar código por credenciais:", err);
        const message =
          err instanceof Error
            ? err.message
            : "Ocorreu um erro inesperado. Por favor, tente novamente.";
        setErrorMessage(message);
        setStatus("error");
      }
    };

    exchangeAuthCode();
  }, [searchParams, router]);

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <>
            <LoadingSpinner size="lg" />
            <h2 className="text-2xl font-bold text-gray-800 mt-4">
              A finalizar a conexão com o Mercado Pago...
            </h2>
            <p className="text-gray-600 mt-2">
              Isto pode levar alguns segundos. Por favor, não feche esta página.
            </p>
          </>
        );
      case "success":
        return (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-emerald-700">
              Conta conectada com sucesso!
            </h2>
            <p className="text-gray-600 mt-2">
              Tudo pronto para receber pagamentos. A redirecionar para o seu
              painel...
            </p>
          </>
        );
      case "error":
        return (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-700">
              Falha na Conexão
            </h2>
            <p className="text-gray-600 mt-2 bg-red-50 p-3 rounded-md">
              {errorMessage}
            </p>
            <button
              onClick={() => router.push("/owner?tab=settings")}
              className="mt-6 px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700"
            >
              Voltar para Configurações
            </button>
          </>
        );
    }
  };

  return (
    <OwnerRoute>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
        <div className="max-w-md">{renderContent()}</div>
      </div>
    </OwnerRoute>
  );
}
