"use client";

import { useState, useCallback } from "react"; // Adicionado useCallback
import { httpsCallable } from "firebase/functions";
import { functions } from "../lib/firebaseConfig"; // Removido 'auth' pois usaremos o hook
import {
  CreateConnectedAccountResult,
  CreateAccountLinkResult,
  PendingAppointment,
} from "../types";
import { useAuth } from "../contexts/AuthContext";
import { errorUtils } from "../lib/utils"; // Removido currencyUtils se não for usado aqui

// ========== STRIPE ACCOUNT HOOK ==========
export function useStripeAccount() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // Função genérica para chamar uma Cloud Function, evitando repetição de código.
  const callStripeFunction = useCallback(
    async <T>(functionName: string): Promise<T | null> => {
      if (!currentUser) {
        const authError = "Usuário não autenticado.";
        setError(authError);
        throw new Error(authError);
      }

      setLoading(true);
      setError(null);

      try {
        const callableFunction = httpsCallable<void, { success: boolean } & T>(
          functions,
          functionName
        );
        const result = await callableFunction();
        if (result.data.success) {
          return result.data;
        }
        throw new Error(`Erro ao executar a função: ${functionName}`);
      } catch (err) {
        const errorMessage = errorUtils.getFirebaseErrorMessage(err);
        setError(errorMessage);
        // Re-lançar o erro permite que o componente que chama o hook também possa tratar o erro se necessário.
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [currentUser]
  ); // useCallback memoriza a função para evitar recriações desnecessárias.

  const createConnectedAccount = async (): Promise<string | null> => {
    const result = await callStripeFunction<CreateConnectedAccountResult>(
      "createconnectedaccount"
    );
    return result?.accountId ?? null;
  };

  const createAccountLink = async (): Promise<string | null> => {
    const result = await callStripeFunction<CreateAccountLinkResult>(
      "createaccountlink"
    );
    return result?.url ?? null;
  };

  return { loading, error, createConnectedAccount, createAccountLink };
}

// ========== STRIPE PAYMENT HOOK ==========
export interface PaymentData extends PendingAppointment {
  dateTime: Date;
}

export function useStripePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth(); // Usando o hook para consistência

  const processPayment = async (
    paymentMethodId: string,
    paymentData: PaymentData
  ): Promise<{ success: boolean; paymentIntentId?: string }> => {
    if (!currentUser) {
      const authError = "Usuário não autenticado.";
      setError(authError);
      throw new Error(authError);
    }

    setLoading(true);
    setError(null);

    try {
      const token = await currentUser.getIdToken();
      console.log("Enviando token:", token);
      // Padrão de mercado: Enviar o token de autenticação no cabeçalho (Header) da requisição.
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // O token vai aqui
        },
        body: JSON.stringify({
          // O corpo da requisição agora contém apenas os dados da transação.
          paymentMethodId,
          appointmentDetails: {
            ...paymentData,
            bookingTimestamp: paymentData.dateTime.toISOString(),
          },
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erro no pagamento");
      }

      return { success: true, paymentIntentId: result.paymentIntentId };
    } catch (err) {
      const errorMessage = errorUtils.getFirebaseErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, processPayment };
}
